import { jwtDecode } from "jwt-decode";

/**
 * Reads the JWT token from localStorage (then sessionStorage) and decodes it.
 * Admin app uses "authToken" key. Returns { id, email, role } from the token payload.
 * @returns {{ id, email, role } | null}
 */
export function extractUserFromToken() {
    try {
        let token = localStorage.getItem("authToken");
        if (!token) token = sessionStorage.getItem("authToken");
        if (!token) return null;

        const payload = jwtDecode(token);
        return {
            id: payload.id ?? payload.sub ?? null,
            email: payload.email ?? null,
            role: payload.role ?? null,
        };
    } catch {
        return null;
    }
}
