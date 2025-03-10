import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  Card,
  CardContent,
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
} from "recharts";
import useAxios from "../utils/useAxios";

const Overview = () => {
  const { axiosInstance } = useAxios();
  const [customers, setCustomers] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Dropdown filter states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");

  // Pagination and search states for table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Unique Payment Methods for dropdown
  const uniquePaymentMethods = [
    ...new Set(customers.map((c) => c.PaymentMethod)),
  ].filter(Boolean); // remove null/undefined

  // Filtered dataset by Payment Method and Gender
  const filteredCustomers = customers.filter((c) => {
    const matchesPayment =
      selectedPaymentMethod === "All" || c.PaymentMethod === selectedPaymentMethod;
    const matchesGender =
      selectedGender === "All" || c.gender === parseInt(selectedGender, 10);
    return matchesPayment && matchesGender;
  });

  // Additional search filter on customerID, Email, PaymentMethod, and Gender
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

  // Basic metrics
  const totalCustomers = filteredCustomers.length;
  const churnedCustomers = filteredCustomers.filter((c) => c.Churn === 1);
  const churnCount = churnedCustomers.length;
  const churnRate = totalCustomers ? (churnCount / totalCustomers) * 100 : 0;

  // Average Monthly Charge
  const avgMonthlyCharge = totalCustomers
    ? filteredCustomers.reduce((sum, c) => sum + c.MonthlyCharges, 0) /
      totalCustomers
    : 0;

  // Churn Score (modeled as average satisfaction)
  const avgSatisfaction = totalCustomers
    ? filteredCustomers.reduce((sum, c) => sum + c.SatisfactionScore, 0) /
      totalCustomers
    : 0;

  // Average Lifetime Value
  const avgLTV = totalCustomers
    ? filteredCustomers.reduce((sum, c) => sum + c.LifetimeValue, 0) /
      totalCustomers
    : 0;

  // (1) PaymentTimeliness vs Churn (Bar)
  const paymentGroups = {};
  churnedCustomers.forEach((c) => {
    const pt = c.PaymentTimeliness; // e.g. 0/1/2?
    if (!paymentGroups[pt]) {
      paymentGroups[pt] = { name: `PT ${pt}`, churnedCount: 0 };
    }
    paymentGroups[pt].churnedCount++;
  });
  const paymentTimelinessData = Object.values(paymentGroups);

  // (2) SatisfactionScore vs Churn (Line)
  const satisfactionGroups = {};
  filteredCustomers.forEach((c) => {
    const score = c.SatisfactionScore;
    if (!satisfactionGroups[score]) {
      satisfactionGroups[score] = { score, churned: 0 };
    }
    if (c.Churn === 1) satisfactionGroups[score].churned++;
  });
  const satisfactionData = Object.values(satisfactionGroups).sort(
    (a, b) => a.score - b.score
  );

  // (3) AverageDailyUsage vs Churn (Bar)
  const usageBins = {};
  churnedCustomers.forEach((c) => {
    const usage = Math.floor(c.AverageDailyUsage);
    if (!usageBins[usage]) {
      usageBins[usage] = { name: `Usage ~${usage}`, churnedCount: 0 };
    }
    usageBins[usage].churnedCount++;
  });
  const usageData = Object.values(usageBins).sort((a, b) => {
    const x = parseInt(a.name.split("~")[1], 10);
    const y = parseInt(b.name.split("~")[1], 10);
    return x - y;
  });

  // (4) Age vs Churn (Line)
  const ageGroups = {};
  filteredCustomers.forEach((c) => {
    const age = c.Age;
    if (!ageGroups[age]) {
      ageGroups[age] = { age, total: 0, churned: 0 };
    }
    ageGroups[age].total++;
    if (c.Churn === 1) ageGroups[age].churned++;
  });
  const ageData = Object.values(ageGroups)
    .map((group) => ({
      age: group.age,
      churnRate: group.total ? group.churned / group.total : 0,
    }))
    .sort((a, b) => a.age - b.age);

  // (5) Gender vs Churn (Pie)
  const churnedMaleCount = filteredCustomers.filter(
    (c) => c.gender === 1 && c.Churn === 1
  ).length;
  const churnedFemaleCount = filteredCustomers.filter(
    (c) => c.gender === 0 && c.Churn === 1
  ).length;
  const genderChurnData = [
    { name: "Male", value: churnedMaleCount },
    { name: "Female", value: churnedFemaleCount },
  ];

  // Pagination handlers for the table
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

      {/* ===================== OVERVIEW TAB ===================== */}
      {tabValue === 0 && (
        <>
          {/* Filter Row */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={selectedPaymentMethod}
                  label="Payment Method"
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  {uniquePaymentMethods.map((pm) => (
                    <MenuItem key={pm} value={pm}>
                      {pm}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={selectedGender}
                  label="Gender"
                  onChange={(e) => setSelectedGender(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="0">Female</MenuItem>
                  <MenuItem value="1">Male</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* KPI Row */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} md={2}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="error">
                    {churnCount}
                  </Typography>
                  <Typography variant="subtitle1">Churned</Typography>
                  <Typography variant="body2">
                    {churnRate.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} md={2}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{totalCustomers}</Typography>
                  <Typography variant="subtitle1">Total Customers</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} md={2}>
              <Card>
                <CardContent>
                  <Typography variant="h5">
                    ${avgMonthlyCharge.toFixed(2)}
                  </Typography>
                  <Typography variant="subtitle1">Monthly Charge</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} md={2}>
              <Card>
                <CardContent>
                  <Typography variant="h5">
                    {avgSatisfaction.toFixed(1)}
                  </Typography>
                  <Typography variant="subtitle1">Churn Score</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} md={2}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{avgLTV.toFixed(0)}</Typography>
                  <Typography variant="subtitle1">CLTV</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts: First row (3 charts) */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">
                PaymentTimeliness vs Churned Customers
              </Typography>
              <BarChart width={350} height={250} data={paymentTimelinessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="churnedCount" fill="#FF0000" />
              </BarChart>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6">SatisfactionScore vs Churn</Typography>
              <LineChart width={350} height={250} data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="churned"
                  name="Churned Count"
                  stroke="#FF0000"
                />
              </LineChart>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6">AverageDailyUsage vs Churn</Typography>
              <BarChart width={350} height={250} data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="churnedCount" fill="#8884d8" />
              </BarChart>
            </Grid>
          </Grid>

          {/* Charts: Second row (2 charts) */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Age vs Churn Rate</Typography>
              <LineChart width={400} height={300} data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="churnRate"
                  name="Churn Rate"
                  stroke="#FF0000"
                  dot={false}
                />
              </LineChart>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6">Gender vs Churn</Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={genderChurnData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#FFBB28" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Grid>
          </Grid>
        </>
      )}

      {/* ===================== DETAIL TABLE TAB ===================== */}
      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Detailed Customer Table
          </Typography>

          {/* Search Filter */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Search by CustomerID, Email, PaymentMethod, or Gender"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0); // reset page on search
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
