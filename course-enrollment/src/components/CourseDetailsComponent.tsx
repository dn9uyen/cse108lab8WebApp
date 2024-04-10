import React, { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper
} from "@mui/material";

interface CourseDetailsProps {
  course: any;
  onBack: () => void;
  username: string;
  sessionToken: string;
}

const CourseDetailsTableComponent: React.FC<CourseDetailsProps> = ({
  course,
  onBack,
  username,
  sessionToken,
}) => {
  const [grades, setGrades] = useState<{ name: string; grade: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleGradeChange = (index: any, value: any) => {
    const newGrades = [...grades];
    newGrades[index].grade = value;
    setGrades(newGrades);
  };

  const saveGrade = async (name: any, grade: any) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/account/courses/grades", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          sessionToken: sessionToken,
          courseName: course,
          name: name,
          grade: grade,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save grade");
      }

    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/account/courses/manage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: username, sessionToken: sessionToken, courseName: course }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch grades");
        }

        const data = await response.json();
        setGrades(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [course.courseName, sessionToken, username]);

  const cellStyle = {
    borderRight: '1px solid rgba(224, 224, 224, 1)',
  };

  const gradeCellStyle = {
    width: '30%',
  };

  return (
    <div>
      <Button onClick={onBack}>Back</Button>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow style={{ borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>
                <TableCell style={cellStyle}>Student Name</TableCell>
                <TableCell style={gradeCellStyle}>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade, index) => (
                <TableRow key={grade.name}>
                  <TableCell component="th" scope="row" style={cellStyle}>
                    {grade.name}
                  </TableCell>
                  <TableCell style={gradeCellStyle}>
                    <TextField
                      value={grade.grade}
                      onChange={(e) => handleGradeChange(index, e.target.value)}
                      onBlur={() => saveGrade(grade.name, grade.grade)}
                      inputProps={{ style: { textAlign: 'right', width: '100%' } }}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default CourseDetailsTableComponent;