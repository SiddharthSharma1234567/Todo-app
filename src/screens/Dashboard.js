import React, { useEffect, useState } from 'react';
import "../cssFiles/dashboard.css";
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Tasks from './Tasks';

export default function Dashboard() {
  const [newPage,setNewPage]=useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {category}=useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/checkAuth', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json()) // Parse the JSON response
      .then((data) => {
        if (data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate("/login");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div id="dashboard">
      <Sidebar currentCategory={category} newPage={newPage} setNewPage={setNewPage} />
      <Tasks currentCategory={category} newPage={newPage} setNewPage={setNewPage} />
    </div>
  );
}
