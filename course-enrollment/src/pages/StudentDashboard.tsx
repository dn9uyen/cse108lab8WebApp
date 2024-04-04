import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Paper, Tab } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import React, { useEffect } from "react";
import LogoutComponent from "../components/LogoutComponent";
import * as CookieUtil from "../CookieUtil"
import { useNavigate } from "react-router-dom";
import EnrolledCoursesTableComponent from "../components/EnrolledCoursesTableComponent";
import RegisterCoursesTableComponent from "../components/RegisterCoursesTableComponent";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = React.useState("current");
    const [role, setRole] = React.useState(CookieUtil.getRoleCookie())
    const [name, setName] = React.useState(CookieUtil.getFullNameCookie())
    const [json, setJson] = React.useState("")

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
        getUserCourses();
    };

    const getUserCourses = async () => {
        const response = await fetch("http://127.0.0.1:5000/account/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "username": CookieUtil.getUsernameCookie(), "sessionToken": CookieUtil.getSessionTokenCookie() })
        });
        const responseJson = await response.json();
        setJson(responseJson);
    }

    useEffect(() => {
        getUserCourses();
    }, []) // Run once on page load

    useEffect(() => {
        if (CookieUtil.getRoleCookie() == "") {
            navigate("/")
        }
    })

    return (
        <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper elevation={10} sx={{ padding: "15px", width: "80vw" }}>
                <Grid container spacing={2}>
                    <Grid xs={3}>
                        <h4 style={{ margin: 0, paddingLeft: "5%" }}>{role} {name}</h4>
                    </Grid>
                    <Grid xs={2.25} />
                    <Grid xs={4}>
                        <h3 style={{ margin: 0 }}>UCM Courses</h3>
                    </Grid>
                    <Grid xs={1.75} />
                    <Grid xs={1}>
                        <LogoutComponent />
                    </Grid>
                </Grid>

                <Box sx={{ padding: "2vh" }} />

                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <TabList onChange={handleTabChange} centered>
                            <Tab label="Current Courses" value="current" />
                            <Tab label="Register Courses" value="register" />
                        </TabList>
                    </Box>
                    <TabPanel value="current"><EnrolledCoursesTableComponent json={json} /></TabPanel>
                    <TabPanel value="register"><RegisterCoursesTableComponent json={json} /></TabPanel>
                </TabContext>

            </Paper >
        </Box>
    )
}

