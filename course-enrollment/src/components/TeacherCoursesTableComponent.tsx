import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import * as CookieUtil from "../CookieUtil";

type CourseType = {
  courseName: string;
  teacher: string;
  time: string;
  seatsTaken: number;
  seatsTotal: number;
};

type TableRowType = {
    courseName: string;
    teacher: string;
    time: string;
    studentsEnrolled: string;
};

interface TeacherCoursesTableComponentProps {
    json: CourseType[];
    onCourseSelect: (courseName: string) => void;
}

export default function TeacherCoursesTableComponent({ json, onCourseSelect }: TeacherCoursesTableComponentProps) {
    const [table, setTable] = useState<TableRowType[]>([]);

    useEffect(() => {
        const rows = json.filter(course => course.teacher === CookieUtil.getFullNameCookie()).map(course => ({
          courseName: course.courseName,
          teacher: course.teacher,
          time: course.time,
          studentsEnrolled: `${course.seatsTaken}/${course.seatsTotal}`,
        }));
        setTable(rows);
    }, [json]);

    const handleCourseSelect = (courseName: string) => {
        onCourseSelect(courseName);
    };

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
                            <TableCell align="left">
                                <span
                                    onClick={() => handleCourseSelect(row.courseName)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    role="button"
                                    tabIndex={0}
                                    >
                                    {row.courseName}
                                </span>
                            </TableCell>
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