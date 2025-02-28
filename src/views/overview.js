import React, { useEffect, useState } from "react";
import { Tabs, Tab, Box, Grid, Typography } from "@mui/material";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from "recharts";
import useAxios from "../utils/useAxios";

const Overview = () => {
  const { axiosInstance } = useAxios();
  const [customers, setCustomers] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/customers/");
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchData();
  }, []);

  const churnData = [
    { name: "Churned", value: customers.filter(c => c.Churn === 1).length },
    { name: "Retained", value: customers.filter(c => c.Churn === 0).length },
  ];

  const tenureChurnData = customers.map(c => ({
    tenure: c.tenure,
    Churned: c.Churn === 1 ? 1 : 0,
  }));

  const internetServiceChurnData = customers.reduce((acc, c) => {
    const service = c.InternetService;
    if (!acc[service]) acc[service] = { name: service, Churned: 0, Retained: 0 };
    acc[service][c.Churn === 1 ? "Churned" : "Retained"] += 1;
    return acc;
  }, {});

  const avgMonthlyChargesByChurn = [
    { name: "Churned", avgCharge: customers.filter(c => c.Churn === 1).reduce((sum, c) => sum + c.MonthlyCharges, 0) / customers.filter(c => c.Churn === 1).length || 0 },
    { name: "Retained", avgCharge: customers.filter(c => c.Churn === 0).reduce((sum, c) => sum + c.MonthlyCharges, 0) / customers.filter(c => c.Churn === 0).length || 0 },
  ];

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Overview" />
        <Tab label="Churn by Demographics" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Churn Distribution</Typography>
            <PieChart width={400} height={300}>
              <Pie data={churnData} dataKey="value" nameKey="name" outerRadius={100} fill="#8884d8">
                {churnData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#FF0000" : "#00C49F"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6">Churn Rate by Tenure</Typography>
            <LineChart width={400} height={300} data={tenureChurnData}>
              <XAxis dataKey="tenure" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Churned" stroke="#FF0000" />
            </LineChart>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6">Churn Breakdown by Internet Service</Typography>
            <BarChart width={400} height={300} data={Object.values(internetServiceChurnData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Churned" fill="#FF0000" />
              <Bar dataKey="Retained" fill="#00C49F" />
            </BarChart>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Average Monthly Charges by Churn</Typography>
            <BarChart width={400} height={300} data={avgMonthlyChargesByChurn}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgCharge" fill="#8884d8" />
            </BarChart>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Overview;
