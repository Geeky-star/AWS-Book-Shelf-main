import { Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
    <Link to="/home">HomePage</Link>
    <Link to="/signUp">Register</Link>
    <Link to="/signIn">Sign In</Link>
    </div>
  );
}

export default App;
