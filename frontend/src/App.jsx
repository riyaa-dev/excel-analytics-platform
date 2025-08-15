import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import all your components
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landingpage';
import Profile from './pages/Profile'; // ADD THIS MISSING IMPORT
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* FIXED: Added missing <Route> tag and proper structure */}
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
