import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as CookieUtil from "../CookieUtil"

export default function LogoutComponent(props: any) {
    const navigate = useNavigate()

    const logout = async () => {
        let response = await fetch("http://127.0.0.1:5000/account/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "username": username, "sessionToken": sessionToken })
        });
        // TODO: check response before redirect

        CookieUtil.deleteCookiesLogout();
        navigate("/");
    }

    return (
        <Button onClick={logout} sx={{ padding: "3px" }}><h4 style={{ margin: 0 }}>Logout</h4></Button>
    )
}
