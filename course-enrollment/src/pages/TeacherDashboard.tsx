import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Paper, Tab } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import LogoutComponent from "../components/LogoutComponent";
import TeacherCoursesTableComponent from "../components/TeacherCoursesTableComponent";
import CourseDetailsComponent from "../components/CourseDetailsComponent";
import * as CookieUtil from "../CookieUtil";

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState("1");
    const [name, setName] = useState(CookieUtil.getFullNameCookie());
    const [json, setJson] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
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
    }, [selectedCourse]); // Run once on page load

    useEffect(() => {
        if (CookieUtil.getRoleCookie() === "") {
            navigate("/");
        }
    }, [navigate]);

    return (
        <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper elevation={10} sx={{ padding: "15px", width: "80vw" }}>
                <Grid container spacing={2}>
                    <Grid xs={3}>
                        <h4 style={{ margin: 0, paddingLeft: "5%" }}>Welcome {name}!</h4>
                    </Grid>
                    <Grid xs={2} />
                    <Grid xs={4}>
                        <h3 style={{ margin: 0 }}>Class management</h3>
                    </Grid>
                    <Grid xs={2} />
                    <Grid xs={1}>
                        <LogoutComponent />
                    </Grid>
                </Grid>

                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <TabList onChange={handleTabChange} centered>
                            <Tab label="Your Courses" value="1" />
                        </TabList>
                    </Box>

                    <TabPanel value="1">
                        {selectedCourse ? (
                            <CourseDetailsComponent 
                                course={selectedCourse} 
                                onBack={() => setSelectedCourse(null)}
                                username={CookieUtil.getUsernameCookie()}
                                sessionToken={CookieUtil.getSessionTokenCookie()}
                            />
                        ) : (
                            <TeacherCoursesTableComponent json={json} onCourseSelect={setSelectedCourse} />
                        )}
                    </TabPanel>
                </TabContext>
            </Paper>
        </Box>
    );
}