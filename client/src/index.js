import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import UserBooks from './components/UserBooks';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<App/>}/>
      <Route path="/home" element = {<HomePage/>}/>
      <Route path="/signUp" element = {<SignUp/>}/>
      <Route path="/signIn" element = {<SignIn/>}/>
      <Route path="/home" element = {<HomePage/>} />
      <Route path="/profile" element={<ProfilePage/>}></Route>
      <Route path="/UserBooks" element={<UserBooks/>}></Route>
    </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
