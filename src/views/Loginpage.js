import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Loginpage() {
  const { loginUser } = useContext(AuthContext);
  const history = useHistory();
  
  const handleSubmit = e => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (email.length > 0) loginUser(email, password);
  };

  const handlePasswordReset = () => {
    // Navigate to the Password Reset Request page
    history.push('/password-reset');
  };

  return (
    <div>
      <section className="vh-100" style={{ backgroundColor: "#9A616D" }}>
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-xl-10">
              <div className="card" style={{ borderRadius: "1rem" }}>
                <div className="row g-0">
                  <div className="col-md-6 col-lg-5 d-none d-md-block">
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                      alt="login form"
                      className="img-fluid"
                      style={{ borderRadius: "1rem 0 0 1rem" }}
                    />
                  </div>
                  <div className="col-md-6 col-lg-7 d-flex align-items-center">
                    <div className="card-body p-4 p-lg-5 text-black">
                      <form onSubmit={handleSubmit}>
                        <div className="d-flex align-items-center mb-3 pb-1">
                          <i className="fas fa-cubes fa-2x me-3" style={{ color: "#ff6219" }} />
                          <span className="h2 fw-bold mb-0">Welcome back 👋</span>
                        </div>
                        <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: 1 }}>
                          Sign into your account
                        </h5>
                        <div className="form-outline mb-4">
                          <input
                            type="email"
                            id="form2Example17"
                            className="form-control form-control-lg"
                            name="email"
                          />
                          <label className="form-label" htmlFor="form2Example17">
                            Email address
                          </label>
                        </div>
                        <div className="form-outline mb-4">
                          <input
                            type="password"
                            id="form2Example27"
                            className="form-control form-control-lg"
                            name="password"
                          />
                          <label className="form-label" htmlFor="form2Example27">
                            Password
                          </label>
                        </div>
                        <div className="pt-1 mb-4">
                          <button className="btn btn-dark btn-lg btn-block" type="submit">
                            Login
                          </button>
                        </div>
                        {/* Update Forgot password to navigate to Password Reset */}
                        <button
                          className="small text-muted"
                          style={{ background: "none", border: "none", color: "#007bff", padding: 0, cursor: "pointer" }}
                          onClick={handlePasswordReset}
                        >
                          Forgot password?
                        </button>
                        <p className="mb-5 pb-lg-2" style={{ color: "#393f81" }}>
                          Don't have an account?{" "}
                          <Link to="/register" style={{ color: "#393f81" }}>
                            Register Now
                          </Link>
                        </p>
                        <button
                          className="small text-muted"
                          style={{ background: "none", border: "none", color: "#007bff", padding: 0, cursor: "pointer" }}
                          onClick={() => console.log('Terms of use clicked')}
                        >
                          Terms of use
                        </button>
                        <button
                          className="small text-muted"
                          style={{ background: "none", border: "none", color: "#007bff", padding: 0, cursor: "pointer" }}
                          onClick={() => console.log('Privacy policy clicked')}
                        >
                          Privacy policy
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-light text-center text-lg-start">
        <div className="text-center p-3" style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
          © 2019 - till date Copyright
          <a className="text-dark" href="">
            
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Loginpage;
