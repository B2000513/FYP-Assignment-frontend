import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingDown,
  Group,
  AttachMoney,
  SentimentSatisfied,
  MonetizationOn,
  Percent,
} from "@mui/icons-material";
import useAxios from "../utils/useAxios";

// Helper function to label Payment Timeliness
function getTimelinessLabel(value) {
  return value === 1 ? "Late" : "On-time";
}

const Overview = () => {
  const { axiosInstance } = useAxios();
  const [customers, setCustomers] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // NEW FILTER STATES
  const [selectedChurn, setSelectedChurn] = useState("All"); // All, Churned, Retained
  const [selectedInternet, setSelectedInternet] = useState("All"); // DSL, Fiber Optic, No
  const [selectedTimeliness, setSelectedTimeliness] = useState("All"); // Late, On-time

  // TABLE STATES
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Data
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
  }, [axiosInstance]);

  // Filtered dataset (using the 3 new filters)
  const filteredCustomers = customers.filter((c) => {
    // Filter by Churn status
    const matchesChurn =
      selectedChurn === "All" ||
      (selectedChurn === "Churned" && c.Churn === 1) ||
      (selectedChurn === "Retained" && c.Churn === 0);

    // Filter by Internet Service
    const matchesInternet =
      selectedInternet === "All" || c.InternetService === selectedInternet;

    // Filter by Payment Timeliness
    const timelinessLabel = getTimelinessLabel(c.PaymentTimeliness);
    const matchesTimeliness =
      selectedTimeliness === "All" || timelinessLabel === selectedTimeliness;

    return matchesChurn && matchesInternet && matchesTimeliness;
  });

  // Additional search filter for the detail table
  const filteredAndSearchedCustomers = filteredCustomers.filter((c) => {
    const query = searchQuery.toLowerCase();
    const genderStr = c.gender === 1 ? "male" : "female";
    return (
      c.customerID.toLowerCase().includes(query) ||
      c.Email.toLowerCase().includes(query) ||
      c.PaymentMethod.toLowerCase().includes(query) ||
      genderStr.includes(query)
    );
  });

  // KPI Metrics
  const totalCustomers = filteredCustomers.length;
  const churnedCustomers = filteredCustomers.filter((c) => c.Churn === 1);
  const churnCount = churnedCustomers.length;
  const churnRate = totalCustomers ? (churnCount / totalCustomers) * 100 : 0;
  const avgMonthlyCharge = totalCustomers
    ? filteredCustomers.reduce((sum, c) => sum + c.MonthlyCharges, 0) /
      totalCustomers
    : 0;
  const avgSatisfaction = totalCustomers
    ? filteredCustomers.reduce((sum, c) => sum + c.SatisfactionScore, 0) /
      totalCustomers
    : 0;
  const avgLTV = totalCustomers
    ? filteredCustomers.reduce((sum, c) => sum + c.LifetimeValue, 0) /
      totalCustomers
    : 0;

  // ------------------------------
  // CHART DATA CALCULATIONS
  // ------------------------------

  // (1) Payment Timeliness vs Churn => grouped bar chart
  const paymentMap = {
    Late: { name: "Late", churned: 0, retained: 0 },
    "On-time": { name: "On-time", churned: 0, retained: 0 },
  };
  filteredCustomers.forEach((c) => {
    const label = getTimelinessLabel(c.PaymentTimeliness);
    if (!paymentMap[label]) {
      paymentMap[label] = { name: label, churned: 0, retained: 0 };
    }
    if (c.Churn === 1) {
      paymentMap[label].churned++;
    } else {
      paymentMap[label].retained++;
    }
  });
  const paymentTimelinessData = Object.values(paymentMap);

  // (2) Satisfaction Score vs Churn => average satisfaction for churned vs. retained
  const churn0 = filteredCustomers.filter((c) => c.Churn === 0);
  const churn1 = filteredCustomers.filter((c) => c.Churn === 1);
  const avgSat0 =
    churn0.reduce((sum, c) => sum + c.SatisfactionScore, 0) / churn0.length || 0;
  const avgSat1 =
    churn1.reduce((sum, c) => sum + c.SatisfactionScore, 0) / churn1.length || 0;
  const satisfactionData = [
    { name: "Retained", value: avgSat0 },
    { name: "Churned", value: avgSat1 },
  ];

  // (3) Daily Usage vs Churn => average daily usage for churned vs. retained
  const avgUsage0 =
    churn0.reduce((sum, c) => sum + c.AverageDailyUsage, 0) / churn0.length || 0;
  const avgUsage1 =
    churn1.reduce((sum, c) => sum + c.AverageDailyUsage, 0) / churn1.length || 0;
  const usageData = [
    { name: "Retained", value: avgUsage0 },
    { name: "Churned", value: avgUsage1 },
  ];

  // (4) Age vs Churn Rate => line chart showing churn rate (churned/total) by age
  const ageGroup = {};
  filteredCustomers.forEach((c) => {
    const age = c.Age;
    if (!ageGroup[age]) {
      ageGroup[age] = { age, total: 0, churned: 0 };
    }
    ageGroup[age].total++;
    if (c.Churn === 1) {
      ageGroup[age].churned++;
    }
  });
  const ageData = Object.values(ageGroup)
    .map((group) => ({
      age: group.age,
      churnRate: group.total ? group.churned / group.total : 0,
    }))
    .sort((a, b) => a.age - b.age);

  // (5) Gender vs Churn => grouped bar chart for gender (all customers)
  const genderMap = { Male: { name: "Male", churned: 0, retained: 0 }, Female: { name: "Female", churned: 0, retained: 0 } };
  filteredCustomers.forEach((c) => {
    const key = c.gender === 1 ? "Male" : "Female";
    if (c.Churn === 1) {
      genderMap[key].churned++;
    } else {
      genderMap[key].retained++;
    }
  });
  const genderChartData = Object.values(genderMap);

  // (6) Contract vs Churn => grouped bar chart for contract types
  const contractMap = {};
  filteredCustomers.forEach((c) => {
    const contract = c.Contract;
    if (!contractMap[contract]) {
      contractMap[contract] = { name: contract, churned: 0, retained: 0 };
    }
    if (c.Churn === 1) {
      contractMap[contract].churned++;
    } else {
      contractMap[contract].retained++;
    }
  });
  const contractChartData = Object.values(contractMap);

  // ------------------------------
  // TABLE PAGINATION HANDLERS
  // ------------------------------
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Tabs value={tabValue} onChange={(e, newVal) => setTabValue(newVal)}>
        <Tab label="Overview" />
        <Tab label="Detail Table" />
      </Tabs>

      {tabValue === 0 && (
        <>
          {/* KPI Row */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} md={2}>
              <Card sx={{ backgroundColor: "#e3f2fd", borderRadius: 2, minHeight: 150 }}>
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3 }}
                >
                  <TrendingDown sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
                  <Typography variant="h5" color="error">
                    {churnCount}
                  </Typography>
                  <Typography variant="subtitle1">Churned</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card sx={{ backgroundColor: "#e3f2fd", borderRadius: 2, minHeight: 150 }}>
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3 }}
                >
                  <Group sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                  <Typography variant="h5">{totalCustomers}</Typography>
                  <Typography variant="subtitle1">Total</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card sx={{ backgroundColor: "#e3f2fd", borderRadius: 2, minHeight: 150 }}>
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3 }}
                >
                  <AttachMoney sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
                  <Typography variant="h5">${avgMonthlyCharge.toFixed(2)}</Typography>
                  <Typography variant="subtitle1">Monthly</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card sx={{ backgroundColor: "#e3f2fd", borderRadius: 2, minHeight: 150 }}>
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3 }}
                >
                  <SentimentSatisfied sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
                  <Typography variant="h5">{avgSatisfaction.toFixed(1)}</Typography>
                  <Typography variant="subtitle1">Score</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card sx={{ backgroundColor: "#e3f2fd", borderRadius: 2, minHeight: 150 }}>
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3 }}
                >
                  <MonetizationOn sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} />
                  <Typography variant="h5">{avgLTV.toFixed(0)}</Typography>
                  <Typography variant="subtitle1">CLTV</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card sx={{ backgroundColor: "#e3f2fd", borderRadius: 2, minHeight: 150 }}>
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3 }}
                >
                  <Percent sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
                  <Typography variant="h5" color="error">
                    {churnRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="subtitle1">Churn %</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filter Row */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth>
                <InputLabel>Churn</InputLabel>
                <Select
                  value={selectedChurn}
                  label="Churn"
                  onChange={(e) => setSelectedChurn(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Churned">Churned Only</MenuItem>
                  <MenuItem value="Retained">Retained Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth>
                <InputLabel>Internet Service</InputLabel>
                <Select
                  value={selectedInternet}
                  label="Internet Service"
                  onChange={(e) => setSelectedInternet(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="DSL">DSL</MenuItem>
                  <MenuItem value="Fiber Optic">Fiber Optic</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Timeliness</InputLabel>
                <Select
                  value={selectedTimeliness}
                  label="Payment Timeliness"
                  onChange={(e) => setSelectedTimeliness(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Late">Late</MenuItem>
                  <MenuItem value="On-time">On-time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* ... existing imports, KPI row, and filter row ... */}


          <Grid item xs={12}>
  <Typography variant="h6">Age vs Churn Rate</Typography>
  {/* 🔹 Use ResponsiveContainer for full horizontal width */}
  <Box sx={{ height: 300 }}> {/* Set a fixed height */}
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={ageData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="age" />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(value) => (value * 100).toFixed(0) + '%'}
        />
        <Tooltip
          formatter={(value) => (value * 100).toFixed(1) + '%'}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="churnRate"
          stroke="#FF0000"
          name="Churn Rate"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </Box>
</Grid>


<Grid container spacing={2} sx={{ mb: 2 }}>
  {/* (1) Payment Timeliness vs Churn */}
  <Grid item xs={12} md={4}>
    <Typography variant="h6">Payment Timeliness vs Churn</Typography>
    <BarChart width={350} height={250} data={paymentTimelinessData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="churned" fill="#FF0000" name="Churned" />
      <Bar dataKey="retained" fill="#00C49F" name="Retained" />
    </BarChart>
  </Grid>

  {/* (2) Satisfaction Score vs Churn */}
  <Grid item xs={12} md={4}>
    <Typography variant="h6">Satisfaction Score vs Churn</Typography>
    <BarChart width={350} height={250} data={satisfactionData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#8884d8" name="Avg Satisfaction" />
    </BarChart>
  </Grid>

  {/* (3) Daily Usage vs Churn */}
  <Grid item xs={12} md={4}>
    <Typography variant="h6">Daily Usage vs Churn</Typography>
    <BarChart width={350} height={250} data={usageData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#82ca9d" name="Avg Daily Usage" />
    </BarChart>
  </Grid>
</Grid>

<Grid container spacing={2}>
  {/* (Gender vs Churn) */}
  <Grid item xs={12} md={6}>
    <Typography variant="h6">Gender vs Churn</Typography>
    <BarChart width={500} height={250} data={genderChartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="churned" fill="#FF0000" name="Churned" />
      <Bar dataKey="retained" fill="#00C49F" name="Retained" />
    </BarChart>
  </Grid>

  {/* (Contract vs Churn) */}
  <Grid item xs={12} md={6}>
    <Typography variant="h6">Contract vs Churn</Typography>
    <BarChart width={500} height={250} data={contractChartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="churned" fill="#FF0000" name="Churned" />
      <Bar dataKey="retained" fill="#00C49F" name="Retained" />
    </BarChart>
  </Grid>
</Grid>

        </>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Detailed Customer Table
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Search by CustomerID, Email, PaymentMethod, or Gender"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>CustomerID</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Tenure</TableCell>
                  <TableCell>MonthlyCharges</TableCell>
                  <TableCell>Churn</TableCell>
                  <TableCell>PaymentMethod</TableCell>
                  <TableCell>SatisfactionScore</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSearchedCustomers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((c, index) => (
                    <TableRow key={index}>
                      <TableCell>{c.customerID}</TableCell>
                      <TableCell>{c.gender === 1 ? "Male" : "Female"}</TableCell>
                      <TableCell>{c.Email}</TableCell>
                      <TableCell>{c.Age}</TableCell>
                      <TableCell>{c.tenure}</TableCell>
                      <TableCell>{c.MonthlyCharges}</TableCell>
                      <TableCell>{c.Churn === 1 ? "Yes" : "No"}</TableCell>
                      <TableCell>{c.PaymentMethod}</TableCell>
                      <TableCell>{c.SatisfactionScore}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredAndSearchedCustomers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default Overview;
