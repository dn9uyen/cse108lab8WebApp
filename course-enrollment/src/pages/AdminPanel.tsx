import React, {useEffect} from "react";
import * as CookieUtil from "../CookieUtil.tsx";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
    const navigate = useNavigate();

    useEffect(() => {
        if (CookieUtil.getRoleCookie() == "") {
            navigate("/")
        }
    })

    console.log("Working")

    return (
        <div>
            <iframe title="Admin Panel" src="http://127.0.0.1:5000/admin" width="100%" height="800px" />
        </div>
    );
}
