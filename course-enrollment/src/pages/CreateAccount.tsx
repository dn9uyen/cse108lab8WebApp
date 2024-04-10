import { Box, Button, Divider, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React from "react";
import { useNavigate } from "react-router-dom";
import * as CookieUtil from "../CookieUtil"

export default function CreateAccount() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    const [usernameError, setUsernameError] = React.useState(false);
    const [role, setRole] = React.useState("");
    const handleClickTogglePassword = () => { setShowPassword(!showPassword); }

    const handleRoleChange = (event: SelectChangeEvent) => {
        setRole(event.target.value as string);
    };

    // Submit account info to backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const username = form.username.value;
        const fullname = form.fullname.value;
        const password = form.password.value;

        const response = await fetch("http://127.0.0.1:5000/account/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "username": username, "password": password, "fullname": fullname, "role": role })
        });
        if (response.status != 403) {
            setUsernameError(false);
            const responseJson = await response.json();
            CookieUtil.setUsernameCookie(responseJson["username"])
            CookieUtil.setSessionTokenCookie(responseJson["sessionToken"])
            CookieUtil.setRoleCookie(responseJson["role"])
            CookieUtil.setFullNameCookie(responseJson["fullname"])
            if (responseJson["role"] == "Student") {
                navigate("/StudentDashboard")
            } else if (responseJson["role"] == "Teacher") {
                navigate("/TeacherDashboard")
            } else if (responseJson["role"] == "Admin") {
                navigate("/AdminPanel")
            }

        }
        else {
            setUsernameError(true);
        }
    }

    return (
        <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper elevation={10} sx={{ padding: "15px", width: "max-content" }}>
                <h3 style={{ textAlign: "center", margin: 0 }}>Account Creation</h3>

                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <Paper elevation={5} sx={{ width: "max-content", marginTop: "15px" }}>
                        <FormControl sx={{ width: "25ch" }} variant="outlined">
                            <InputLabel htmlFor="username">Username</InputLabel>
                            <OutlinedInput
                                required
                                error={usernameError}
                                name="username"
                                type="text"
                                label="Password"
                            />
                        </FormControl>
                    </Paper >
                    <FormHelperText error sx={{ visibility: usernameError ? "visible" : "hidden" }}>
                        {usernameError ? "Username already exists" : ""}
                    </FormHelperText>

                    {/* Full name */}
                    <Paper elevation={5} sx={{ width: "max-content", marginTop: "15px" }}>
                        <FormControl sx={{ width: "25ch" }} variant="outlined">
                            <InputLabel htmlFor="fullname">Full Name</InputLabel>
                            <OutlinedInput
                                required
                                name="fullname"
                                type="text"
                                label="Full Name"
                            />
                        </FormControl>
                    </Paper >

                    {/* Password */}
                    <Paper elevation={5} sx={{ width: "max-content", marginTop: "20px" }}>
                        <FormControl sx={{ width: "25ch" }} variant="outlined">
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <OutlinedInput
                                required
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

                    {/* Role */}
                    <Paper elevation={5} sx={{ width: "max-content", marginTop: "20px" }}>
                        <FormControl sx={{ width: "25ch" }} variant="outlined">
                            <InputLabel htmlFor="role">Role</InputLabel>
                            <Select
                                name="role"
                                value={role}
                                label="Role"
                                required
                                onChange={handleRoleChange}
                            >
                                <MenuItem value={"Student"}>Student</MenuItem>
                                <MenuItem value={"Teacher"}>Teacher</MenuItem>
                                <MenuItem value={"Admin"}>Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper >

                    {/* Submit button */}
                    <Box textAlign="center" sx={{ marginTop: "20px" }}>
                        <Button type="submit" variant="contained" sx={{ padding: "10px", width: "100%" }} > Create Account</Button>
                    </Box>
                </form>

                <Divider sx={{ marginTop: "10px", opacity: 1 }}>or</Divider>

                <Box textAlign="center" sx={{ marginTop: "10px" }}>
                    <Button onClick={() => { navigate("/") }} variant="outlined" sx={{ padding: "10px", width: "100%" }}>Login instead</Button>
                </Box>
            </Paper >
        </Box>
    )
}
