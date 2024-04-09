import { Button } from "@mui/material";
import React from "react"; // Import React

interface CourseDetailsProps {
  course: any;
  onBack: () => void;
}

const CourseDetailsComponent: React.FC<CourseDetailsProps> = ({ course, onBack }) => {
  console.log(course);
  return (
    <div>
      <Button onClick={onBack}>Back</Button>
    </div>
  );
};

export default CourseDetailsComponent;