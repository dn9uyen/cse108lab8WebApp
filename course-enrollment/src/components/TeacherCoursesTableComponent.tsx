import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";

export default function TeacherCoursesTableComponent(props) {
    const [table, setTable] = useState([
        {
            courseName: "",
            teacher: "",
            time: "",
            studentsEnrolled: "",
        }
    ])

    useEffect(() => {
        const rows = []
        for (const i in props.json) {
            const course = props.json[i];
            if (course.enrolled) {
                rows.push({
                    courseName: course.courseName,
                    teacher: course.teacher,
                    time: course.time,
                    studentsEnrolled: course.seatsTaken + "/" + course.seatsTotal,
                });
            }
        }
        setTable(rows)
    }, [props]);

    return (
        <TableContainer component={Paper} sx={{}}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="left">Course Name</TableCell>
                        <TableCell align="left">Teacher</TableCell>
                        <TableCell align="left">Time</TableCell>
                        <TableCell align="left">Students Enrolled</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {table.map((row) => (
                        <TableRow key={row.courseName}>
                            <TableCell align="left"> {row.courseName} </TableCell>
                            <TableCell align="left">{row.teacher}</TableCell>
                            <TableCell align="left">{row.time}</TableCell>
                            <TableCell align="left">{row.studentsEnrolled}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
