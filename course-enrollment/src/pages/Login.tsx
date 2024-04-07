import { Box, Button, Divider, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as CookieUtil from "../CookieUtil"

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    const [credentialError, setCredentialError] = React.useState(false);
    const handleClickTogglePassword = () => { setShowPassword(!showPassword); }

    // Submit login info to backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const username = form.username.value;
        const password = form.password.value;
        // TODO: call login function, store returned session key in cookie
        const response = await fetch("http://127.0.0.1:5000/account/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "username": username, "password": password })
        });
        if (response.status != 401) {
            setCredentialError(false);
            const responseJson = await response.json();
            CookieUtil.setUsernameCookie(responseJson["username"])
            CookieUtil.setSessionTokenCookie(responseJson["sessionToken"])
            CookieUtil.setRoleCookie(responseJson["role"])
            CookieUtil.setFullNameCookie(responseJson["fullname"])
            if (responseJson["role"] == "Student") {
                navigate("/StudentDashboard")
            } else if (responseJson["role"] == "Teacher") {
                navigate("/TeacherDashboard")
            }
        }
        else {
            setCredentialError(true);
        }
    }

    useEffect(() => {
        if (CookieUtil.getRoleCookie() == "Student") {
            navigate("/StudentDashboard")
        } else if (CookieUtil.getRoleCookie() == "Teacher") {
            navigate("/TeacherDashboard")
        }
    })

    return (
        <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper elevation={10} sx={{ padding: "15px", width: "max-content" }}>
                <h3 style={{ textAlign: "center", margin: 0 }}>UCM Login</h3>

                <form onSubmit={handleSubmit}>
                    <Paper elevation={5} sx={{ width: "max-content", marginTop: "15px" }}>
                        <FormControl sx={{ width: "25ch" }} variant="outlined">
                            <InputLabel htmlFor="username">Username</InputLabel>
                            <OutlinedInput
                                required
                                error={credentialError}
                                name="username"
                                type="text"
                                label="Password"
                            />
                        </FormControl>
                    </Paper >

                    <Paper elevation={5} sx={{ width: "max-content", marginTop: "20px" }}>
                        <FormControl sx={{ width: "25ch" }} variant="outlined">
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <OutlinedInput
                                required
                                error={credentialError}
                                name="password"
                                type={showPassword ? "text" : "password"}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickTogglePassword}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                            />
                        </FormControl>
                    </Paper >
                    <FormHelperText error sx={{ visibility: credentialError ? "visible" : "hidden" }}>
                        {credentialError ? "Incorrect username or password" : ""}
                    </FormHelperText>

                    <Box textAlign="center" sx={{ marginTop: "20px" }}>
                        <Button type="submit" variant="contained" sx={{ padding: "10px", width: "100%" }} > Login</Button>
                    </Box>
                </form>

                <Divider sx={{ marginTop: "10px", opacity: 1 }}>or</Divider>

                <Box textAlign="center" sx={{ marginTop: "10px" }}>
                    <Button onClick={() => { navigate("/CreateAccount") }} variant="outlined" sx={{ padding: "10px", width: "100%" }}> Create account</Button>
                </Box>

            </Paper >
        </Box>
    )
}
