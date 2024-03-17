import React, { useEffect, useState } from 'react';
import "../cssFiles/dashboard.css";
import { useNavigate } from 'react-router-dom';
import Dsidebar from './Dsidebar';
import Dtask from './Dtask';

export default function Default() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
      <Dsidebar />
      <Dtask />
    </div>
  );
}
