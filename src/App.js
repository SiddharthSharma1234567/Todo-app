import { Fragment } from 'react';
import './App.css';
import Dashboard from './screens/Dashboard.js';
import Login from "./screens/Login.js"
import Signup from './screens/Signup.js';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from './screens/Sidebar.js';
import { useState } from 'react';
import Default from './screens/Default.js';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/:category" element={
              <Dashboard />
          }></Route>
          <Route path="/" element={
              <Default />
          }></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
