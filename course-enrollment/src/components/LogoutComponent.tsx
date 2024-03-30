import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as CookieUtil from "../CookieUtil"

export default function LogoutComponent(props: any) {
    const navigate = useNavigate()

    const logout = async () => {
        //TODO: call backend logout, changePage when reply
        let username = ""
        let sessionToken = ""

        // Get cookies
        let usernameCookie = "username" + "=";
        let sessionTokenCookie = "sessionToken" + "=";
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) == ' ') { cookie = cookie.substring(1, cookie.length); }
            if (cookie.indexOf(usernameCookie) == 0) { username = cookie.substring(usernameCookie.length, cookie.length); }
            if (cookie.indexOf(sessionTokenCookie) == 0) { sessionToken = cookie.substring(sessionTokenCookie.length, cookie.length); }
        }

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
        <Button onClick={logout} sx={{padding: "3px"}}><h4 style={{margin: 0}}>Logout</h4></Button>
    )
}
