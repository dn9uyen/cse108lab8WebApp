import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, Paper, Tab } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import React, { useEffect } from "react";
import LogoutComponent from "../components/LogoutComponent";
import * as CookieUtil from "../CookieUtil"
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = React.useState("1");
    const [role, setRole] = React.useState(CookieUtil.getRoleCookie());
    const [name, setName] = React.useState(CookieUtil.getFullNameCookie());

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

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
                    <Grid xs={2} />
                    <Grid xs={4}>
                        <h3 style={{ margin: 0 }}>Class management</h3>
                    </Grid>
                    <Grid xs={2} />
                    <Grid xs={1}>
                        <LogoutComponent />
                    </Grid>
                </Grid>

                <Box sx={{ padding: "2vh" }} />

                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <TabList onChange={handleTabChange} centered>
                            <Tab label="Current Courses" value="1" />
                            <Tab label="Register Courses" value="2" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">Item One</TabPanel>
                    <TabPanel value="2">Item Two</TabPanel>
                </TabContext>

            </Paper >
        </Box>
    )
}

