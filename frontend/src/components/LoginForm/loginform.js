import React, { useState, useEffect } from "react";
import "./loginform.css"
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const LoginForm = () => {
    // Create state variables for username, password, and password verification
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVerification, setPasswordVerification] = useState("");
    const [isSignUp, setIsSignUp] = useState(false); // State to track whether it's a sign-up or login
    const [showPassword, setShowPassword] = useState(false); // Added state for password visibility
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['userID']);

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

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    }

    // Function to handle sign-up or login button click
    const handleAuthClick = async () => {
        if (isSignUp) {
          if (password === passwordVerification) {
            try {
              const response = await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  username,
                  password,
                }),
              });
      
              if (response.status === 201) {
                const responseData = await response.json();

                console.log("Sign-up successful!");
                console.log("Username:", username);
                console.log("Password:", password);

                setCookie("userID", responseData.userID, { path: '/' })

                navigate("/projects");
              } else {
                console.error("Sign-up failed. User may already exist.");
              }
            } catch (error) {
              console.error("Error:", error);
            }
          } else {
            console.error("Password and password verification do not match.");
          }
        } else {
          try {
            const response = await fetch("http://localhost:5000/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username,
                password,
              }),
            });
      
            if (response.status === 200) {
              const responseData = await response.json();
              console.log(responseData.message);
              // You can also redirect the user to a dashboard or perform other actions upon successful login.

              setCookie("userID", responseData.userID, { path: '/' })
            
              navigate("/projects");
            } else {
              console.error("Login failed. Invalid credentials.");
            }
          } catch (error) {
            console.error("Error:", error);
          }
        }
      };

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
          type={showPassword ? 'text' : 'password'} // Toggle password visibility
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
        <label className="view-password-label">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={togglePasswordVisibility}
            style={{ transform: "scale(1.5)" }}
          />
          👁️
        </label>
        <div className="login-btn" onClick={handleAuthClick}>
          {isSignUp ? "Sign Up" : "Login"}
        </div>
        <p onClick={toggleSignUp} className="toggle-auth-option">
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </p>
      </div>
    );
}

export default LoginForm
