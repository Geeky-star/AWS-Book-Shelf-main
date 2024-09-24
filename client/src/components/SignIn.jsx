import React, { useState } from 'react';
import "./Sign.css";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const signInResult = await axios.post("http://localhost:3005/signIn", {
        email: email,
        password: password
      });
      
      if (signInResult.status === 200) {
        console.log("User successfully logged in");
        navigate("/home");
      }
    } catch (error) {
      console.log("User not logged in.");
      setErrorMessage("Please try again!");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">Sign In</button>
        <Link to="/signUp">Sign Up</Link>
        <br></br>
        <Link to='/UserBooks'>My Books</Link>
      </form>
    </div>
  );
}

export default SignIn;
