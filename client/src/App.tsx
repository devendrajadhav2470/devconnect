import DevConnectNavBar from './components/NavBar';
import { Routes, Route } from 'react-router-dom';
// import Feed from './pages/Feed';
import Profile from './pages/Profile';import Register from './pages/Register';
import Login from './pages/Login';
import HomePage from './pages/HomePage';


function App() {
  return (
    <div className="container mt-4">
      <DevConnectNavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
