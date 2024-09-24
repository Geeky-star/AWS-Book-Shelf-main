import React, { useState } from 'react';
import "./Sign.css";
import {Link} from "react-router-dom";
import axios from "axios";

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
   try{
    console.log("hi")
    const response = await axios.post("http://localhost:3005/register",{email,password})
    console.log(`response ${response}`)

    console.log('Signed up with email:', email, 'and password:', password);
 
   }catch(e){
    console.log(e)
   }
    };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
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
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" >Sign Up</button>

        <Link to='/signIn'>Login</Link>
      </form>
    </div>
  );
}

export default SignUp;
