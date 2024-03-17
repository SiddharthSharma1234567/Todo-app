import React, { useState , useEffect } from 'react'
import "../cssFiles/login.css";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [emailFocus, setEmailFocus] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [emailValue, setEmailValue] = useState();
    const [passwordValue, setPasswordValue] = useState();
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
              if(data.dashboardType=="default"){
                navigate("/");
              }
              else{
                navigate("/"+data.message);
              }
            } else {
              navigate("/login");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }, []);


    const submitForm = () => {
        let email = document.querySelector("#input_email");
        let password = document.querySelector("#input_password");

        const formData = { "email": email.value, "password": password.value };
        email.value = "";
        setEmailValue("");
        setEmailFocus(false);
        password.value = "";
        setPasswordValue("");
        setPasswordFocus(false);
        axios.post("http://localhost:3001/logindata", formData,{ withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    console.log("done");
                    if(response.data.message==="empty"){
                        navigate("/");
                    }
                    else{
                        navigate("/"+response.data.message);
                    }
                } else {
                    console.log("done");
                    console.log("Login failed");
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div id="login">
            <div id="loginForm">
                <div id="login_form_heading">
                    <p>Login Form</p>
                </div>
                <div id="login_form_body">
                    <form id="myform" style={{ height: "100%", width: "100%" }}>
                        <div id="email">
                            <label for="input_email" id={emailFocus ? "other_label_email" : "label_email"} >Email</label>
                            <input type="email" id="input_email" name="input_email" value={emailValue}
                                onChange={(event) => { setEmailValue(event.target.value) }}
                                onFocus={() => { setEmailFocus(true) }}
                                onBlur={(e) => { if (e.target.value == "") { setEmailFocus(false) } }}></input>
                        </div>
                        <div id="password">
                            <label for="input_password" id={passwordFocus ? "other_label_password" : "label_password"}>Password</label>
                            <input type="password" id="input_password" name="input_password" value={passwordValue}
                                onChange={(event) => { setPasswordValue(event.target.value) }}
                                onFocus={() => { setPasswordFocus(true) }}
                                onBlur={(e) => { if (e.target.value == "") { setPasswordFocus(false) } }} ></input>
                        </div>
                        <div id="login_submit_area">
                            <button type="button" id="login_submit_button" onClick={submitForm}>Submit</button>
                        </div>
                        <Link to="/signup" style={{ color: "blue", marginLeft: "100px" }}>Create New Account</Link>
                    </form>
                </div>
            </div>
        </div>
    )
}
