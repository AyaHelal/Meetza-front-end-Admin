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

    // On app startup: read token, set user purely from JWT.
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
                    // Admin app: ALL user identity (id/email/role) comes from token only.
                    setUser(userFromToken);
                    setToken(storedToken);
                }

                // Clean up legacy keys that tried to cache role/name separately
                try {
                    localStorage.removeItem("userRole");
                    localStorage.removeItem("userName");
                    sessionStorage.removeItem("userRole");
                } catch (_) {}

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

    /**
     * Login: store ONLY the token (authToken) + remember flag.
     * All user fields (id/email/role) are read from the JWT, not from userData or storage.
     */
    const loginUser = (_userData, userToken, rememberMe = false) => {
        try {
            if (rememberMe) {
                localStorage.setItem("authToken", userToken);
                localStorage.setItem("remember", "true");
                localStorage.setItem("loginTime", String(Date.now()));
                sessionStorage.removeItem("authToken");
                sessionStorage.removeItem("user");
                setIsRemembered(true);
            } else {
                sessionStorage.setItem("authToken", userToken);
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                localStorage.removeItem("remember");
                localStorage.removeItem("loginTime");
                setIsRemembered(false);
            }

            setToken(userToken);

            const userFromToken = extractUserFromToken();
            if (userFromToken && (userFromToken.id || userFromToken.email)) {
                setUser(userFromToken);
            } else {
                setUser(null);
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
