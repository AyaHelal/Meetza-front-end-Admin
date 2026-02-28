import { createContext, useState, useEffect, useContext } from "react";
import { extractUserFromToken } from "../utils/token";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [isRemembered, setIsRemembered] = useState(false);

    /** Clear all auth + app cache (old keys: userRole, userName, rememberMe, user, authToken). Run once on init. */
    const clearAuthStorage = () => {
        try {
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userName");
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("remember");
            localStorage.removeItem("loginTime");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("userRole");
        } catch (e) {
            console.warn("clearAuthStorage:", e);
        }
    };

    // On app startup: read token, set user from JWT. Remove legacy cache keys (userRole, userName, rememberMe) so role comes from token only.
    useEffect(() => {
        try {
            let storedToken = localStorage.getItem("authToken");
            const rememberFlag = localStorage.getItem("remember");
            const loginTime = localStorage.getItem("loginTime");

            if (!storedToken) storedToken = sessionStorage.getItem("authToken");

            if (storedToken) {
                const rememberedInLocal = rememberFlag === "true";
                if (rememberedInLocal && loginTime) {
                    const currentTime = new Date().getTime();
                    const storedTime = parseInt(loginTime, 10);
                    const twentyFourHours = 24 * 60 * 60 * 1000;
                    if (currentTime - storedTime > twentyFourHours) {
                        clearAuthStorage();
                        setInitializing(false);
                        return;
                    }
                }

                const userFromToken = extractUserFromToken();
                if (userFromToken && (userFromToken.id || userFromToken.email)) {
                    let storedUser = null;
                    try {
                        const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
                        if (raw) storedUser = JSON.parse(raw);
                    } catch (_) {}
                    setUser({ ...storedUser, ...userFromToken });
                    setToken(storedToken);
                    // Delete legacy cache keys so id/email/role come from token only
                    try {
                        localStorage.removeItem("userRole");
                        localStorage.removeItem("userName");
                        sessionStorage.removeItem("userRole");
                    } catch (_) {}
                }
                setIsRemembered(rememberedInLocal);
            } else {
                clearAuthStorage();
            }
        } catch (error) {
            console.error("❌ Error initializing auth:", error);
            clearAuthStorage();
            setIsRemembered(false);
        }
        setInitializing(false);
    }, []);

    const storageSafeUser = (userData) => {
        if (!userData) return null;
        const photo = userData.user_photo ?? userData.photo ?? userData.avatarUrl ?? userData.avatar_url ?? null;
        const safe = { name: userData.name ?? null, photo, user_photo: photo };
        return Object.values(safe).some(v => v != null) ? safe : null;
    };

    const loginUser = (userData, userToken, rememberMe = false) => {
        try {
            const toStore = storageSafeUser(userData);
            if (rememberMe) {
                if (toStore) localStorage.setItem("user", JSON.stringify(toStore));
                else localStorage.removeItem("user");
                localStorage.setItem("authToken", userToken);
                localStorage.setItem("remember", "true");
                localStorage.setItem("loginTime", String(Date.now()));
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("authToken");
                setIsRemembered(true);
            } else {
                if (toStore) sessionStorage.setItem("user", JSON.stringify(toStore));
                else sessionStorage.removeItem("user");
                sessionStorage.setItem("authToken", userToken);
                localStorage.removeItem("user");
                localStorage.removeItem("authToken");
                localStorage.removeItem("remember");
                localStorage.removeItem("loginTime");
                setIsRemembered(false);
            }
            setToken(userToken);
            const userFromToken = extractUserFromToken();
            if (userFromToken && (userFromToken.id || userFromToken.email)) {
                setUser({ ...userData, ...userFromToken });
            } else {
                setUser(userData || null);
            }
        } catch (error) {
            console.error("❌ Failed to save user/token:", error);
        }
    };

    const logoutUser = () => {
        setUser(null);
        setToken(null);
        clearAuthStorage();
        setIsRemembered(false);
    };

    const value = {
        user,
        setUser,
        token,
        initializing,
        isRemembered,
        loginUser,
        logoutUser,
        clearAuthStorage,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
