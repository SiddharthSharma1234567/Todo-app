import React, { useState } from 'react'
import "../cssFiles/signup.css";
import  axios from 'axios';

export default function Signup() {
    const [emailFocus, setEmailFocus] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [emailValue, setEmailValue] = useState("");
    const [passwordValue, setPasswordValue] = useState("");


    const submitForm = () => {
        let email=document.querySelector("#input_email");
        let password=document.querySelector("#input_password");

        const formData={"email":email.value,"password":password.value};
        axios.post("http://localhost:3001/signupdata", formData)
        .then(response => {
            if (response.data.success) {
                console.log("done");
                email.value = "";
                setEmailFocus(false);
                password.value = "";
                setPasswordFocus(false);
                // Redirect on the client side
                window.location.href = "/login";
            } else {
                console.log("Signup failed");
                // Handle the case where signup failed
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
                    <p>Create Account Form</p>
                </div>
                <div id="login_form_body">
                    <form id="myform" style={{ height: "100%", width: "100%" }}>
                        <div id="email">
                            <label htmlFor="input_email" id={emailFocus ? "other_label_email" : "label_email"} >Email</label>
                            <input type="email" id="input_email" name="input_email" value={emailValue}
                                onChange={(event) => { setEmailValue(event.target.value) }}
                                onFocus={() => { setEmailFocus(true) }}
                                onBlur={(e) => { if (e.target.value == "") { setEmailFocus(false) } }}></input>
                        </div>
                        <div id="password">
                            <label htmlFor="input_password" id={passwordFocus ? "other_label_password" : "label_password"}>Password</label>
                            <input type="password" id="input_password" name="input_password" value={passwordValue}
                                onChange={(event) => { setPasswordValue(event.target.value) }}
                                onFocus={() => { setPasswordFocus(true) }}
                                onBlur={(e) => { if (e.target.value == "") { setPasswordFocus(false) } }} ></input>
                        </div>
                        <div id="submit_area">
                            <button type="button" id="submit_button" onClick={submitForm}>Signup</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
