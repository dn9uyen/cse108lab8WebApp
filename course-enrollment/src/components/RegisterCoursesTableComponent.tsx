import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import * as CookieUtil from "../CookieUtil"

export default function EnrolledCoursesTableComponent(props) {
    const [json, setJson] = useState(props.json)
    const [table, setTable] = useState([
        {
            courseName: "",
            teacher: "",
            time: "",
            studentsEnrolled: "",
            enrolled: false
        }
    ])

    useEffect(() => {
        const rows = []
        for (const i in json) {
            const course = json[i];
            rows.push({
                courseName: course.courseName,
                teacher: course.teacher,
                time: course.time,
                studentsEnrolled: course.seatsTaken + "/" + course.seatsTotal,
                enrolled: course.enrolled
            });
        }
        setTable(rows);
    }, [json]);

    const modifyCourse = async (newStatus: boolean, courseName: string) => {

        const response = await fetch("http://127.0.0.1:5000/account/courses", {
            method: newStatus ? "PUT" : "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                {
                    "username": CookieUtil.getUsernameCookie(),
                    "sessionToken": CookieUtil.getSessionTokenCookie(),
                    "courseName": courseName
                }
            )
        });
        const responseJson = await response.json();
        setJson(responseJson);
    }

    const courseButton = (enrolled: boolean, courseName: string, seats: string) => {
        const seatsArr = seats.split("/");
        if (enrolled) {
            return (
                <Button variant="outlined" onClick={() => modifyCourse(!enrolled, courseName)} sx={{ fontSize: "1.25rem" }}>-</Button>
            )
        }
        else {
            if (parseInt(seatsArr[1]) - parseInt(seatsArr[0]) == 0) {
                return (
                    <Button variant="outlined" color="warning" sx={{ fontSize: "1.25rem" }}>~</Button>
                )
            } else {
                return (
                    <Button onClick={() => modifyCourse(!enrolled, courseName)} variant="outlined" sx={{ fontSize: "1.25rem" }}>+</Button>
                )
            }
        }

    }

    return (
        <TableContainer component={Paper} sx={{}}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="left">Course Name</TableCell>
                        <TableCell align="left">Teacher</TableCell>
                        <TableCell align="left">Time</TableCell>
                        <TableCell align="left">Students Enrolled</TableCell>
                        <TableCell align="left" sx={{ maxWidth: 100 }}>Manage</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {table.map((row) => (
                        <TableRow key={row.courseName}>
                            <TableCell align="left"> {row.courseName} </TableCell>
                            <TableCell align="left">{row.teacher}</TableCell>
                            <TableCell align="left">{row.time}</TableCell>
                            <TableCell align="left">{row.studentsEnrolled}</TableCell>
                            <TableCell align="left" sx={{ maxWidth: 100 }}>{courseButton(row.enrolled, row.courseName, row.studentsEnrolled)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
