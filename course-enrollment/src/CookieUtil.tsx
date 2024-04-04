import Cookies from "js-cookie"

export function setUsernameCookie(username: string) {
    Cookies.set("username", username, { expires: 1 })
}

export function getUsernameCookie(): string {
    const username = Cookies.get("username")
    if (username != undefined) { return username }
    else { return "" }
}

export function setFullNameCookie(fullName: string) {
    Cookies.set("fullname", fullName, { expires: 1 })
}

export function getFullNameCookie(): string {
    const fullName = Cookies.get("fullname")
    if (fullName != undefined) { return fullName }
    else { return "" }
}

export function setSessionTokenCookie(sessionToken: string) {
    Cookies.set("sessionToken", sessionToken, { expires: 1 })
}

export function getSessionTokenCookie(): string {
    const sessionToken = Cookies.get("sessionToken")
    if (sessionToken != undefined) { return sessionToken }
    else { return "" }
}

export function setRoleCookie(role: string) {
    Cookies.set("role", role, { expires: 1 })
}

export function getRoleCookie(): string {
    const role = Cookies.get("role")
    if (role != undefined) { return role }
    else { return "" }
}

export function deleteCookiesLogout() {
    Cookies.remove("username")
    Cookies.remove("sessionToken")
    Cookies.remove("role")
    Cookies.remove("fullname")
}
