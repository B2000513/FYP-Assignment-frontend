import { useContext, useState } from "react";
import jwt_decode from "jwt-decode";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const token = localStorage.getItem("authTokens");
  const [open, setOpen] = useState(false);

  let user_id = null;
  if (token) {
    const decoded = jwt_decode(token);
    user_id = decoded.user_id;
  }

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  return (
    <>
      <AppBar position="fixed" color="primary">
        <Toolbar style={{ display: "flex", justifyContent: "space-between", padding: "0 20px" }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1, fontFamily: "Arial, sans-serif", fontWeight: "bold", letterSpacing: "1px" }}>
            <img style={{ width: "120px", padding: "6px" }} src="https://i.imgur.com/juL1aAc.png" alt="Logo" />
          </Typography>
          <div style={{ display: "flex", gap: "20px" }}>
            {!token ? (
              <>
                <Button color="inherit" component={Link} to="/login" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
                  Register
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/dashboard" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
                  Dashboard
                </Button>
                <Button color="inherit" component={Link} to="/profile" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
                  Profile
                </Button>
                <Button color="inherit" onClick={logoutUser} style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <List>
          <ListItem button component={Link} to="/">
            <ListItemText primary="Home" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }} />
          </ListItem>
          {!token ? (
            <>
              <ListItem button component={Link} to="/login">
                <ListItemText primary="Login" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }} />
              </ListItem>
              <ListItem button component={Link} to="/register">
                <ListItemText primary="Register" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }} />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button component={Link} to="/dashboard">
                <ListItemText primary="Dashboard" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }} />
              </ListItem>
              <ListItem button component={Link} to="/profile">
                <ListItemText primary="Profile" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }} />
              </ListItem>
              <ListItem button onClick={logoutUser}>
                <ListItemText primary="Logout" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }} />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
}

export default Navbar;
