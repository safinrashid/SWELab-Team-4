import React, { useState } from "react";
import "./loginform.css"

const LoginForm = () => {
    // Create state variables for username, password, and password verification
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVerification, setPasswordVerification] = useState("");
    const [isSignUp, setIsSignUp] = useState(false); // State to track whether it's a sign-up or login

    // Function to handle username input change
    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    }

    // Function to handle password input change
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }

    // Function to handle password verification input change
    const handlePasswordVerificationChange = (event) => {
        setPasswordVerification(event.target.value);
    }

    // Function to toggle between sign-up and login
    const toggleSignUp = () => {
        setIsSignUp(!isSignUp);
    }

    // Function to handle sign-up or login button click
    const handleAuthClick = () => {
        if (isSignUp) {
            // This is a sign-up, so you can compare the password and password verification
            if (password === passwordVerification) {
                console.log("Sign-up successful!");
                console.log("Username:", username);
                console.log("Password:", password);
            } else {
                console.error("Password and password verification do not match.");
            }
        } else {
            // This is a login
            console.log("Login");
            console.log("Username:", username);
            console.log("Password:", password);
        }
    }

    return (
        <div className="cover">
            <h1>{isSignUp ? "HaaS Sign Up" : "HaaS Login"}</h1>
            <input
                type="text"
                placeholder="username"
                value={username}
                onChange={handleUsernameChange}
            />
            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={handlePasswordChange}
            />
            {isSignUp && (
                <input
                    type="password"
                    placeholder="verify password"
                    value={passwordVerification}
                    onChange={handlePasswordVerificationChange}
                />
            )}
            <div className="login-btn" onClick={handleAuthClick}>
                {isSignUp ? "Sign Up" : "Login"}
            </div>
            <p onClick={toggleSignUp} className="toggle-auth-option">
                {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </p>
        </div>
    )
}

export default LoginForm
