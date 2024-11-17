import React from 'react'

import {BrowserRouter as Router, Route, Switch,Redirect} from "react-router-dom"
import PrivateRoute from "./utils/PrivateRouter"
import { AuthProvider } from './context/AuthContext'

import Homepage from './views/Homepage'
import Registerpage from './views/Registerpage'
import Loginpage from './views/Loginpage'
import Dashboard from './views/Dashboard'
import Navbar from './views/Navbar'
import ProfileSettings from './views/ProfileSetting'
import PasswordResetConfirm from './views/PasswordResetConfirm'
import PasswordResetRequest from './views/PasswordResetRequest'




function App() {
  return (
    
    <Router>
      <AuthProvider>
        <Navbar/>
        <Switch>
          <PrivateRoute component={Dashboard} path="/dashboard" exact />
          <Route component={Loginpage} path="/login" />
          <Route component={Registerpage} path="/register" exact />
          <Route component={Homepage} path="/homepage" exact />
          <Route component={ProfileSettings} path="/profile" exact />
          <Route component={PasswordResetRequest} path="/password-reset" exact />
          <Route component={PasswordResetConfirm} path="/password-reset-confirm/:uid/:token" exact />

        {/* Redirect unknown routes to homepage */}
        <Redirect to="/login" />
        </Switch>
      </AuthProvider>
    </Router>
  )
}

export default App