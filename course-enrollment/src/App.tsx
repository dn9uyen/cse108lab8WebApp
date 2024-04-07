import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import StudentDashboard from "./pages/StudentDashboard"
import TeacherDashboard from "./pages/TeacherDashboard"
import CreateAccount from "./pages/CreateAccount"

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/">
                    <Route index element={<Login />} />
                    <Route path="StudentDashboard" element={<StudentDashboard />} />
                    <Route path="TeacherDashboard" element={<TeacherDashboard />} />
                    <Route path="CreateAccount" element={<CreateAccount />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
