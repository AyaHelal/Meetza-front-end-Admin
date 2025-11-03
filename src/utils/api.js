import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "{{url1}}";

export const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("authToken");
        const locale = localStorage.getItem("locale") || navigator.language?.slice(0, 2) || "en";
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (locale) {
            config.headers = config.headers || {};
            config.headers["X-localization"] = locale;
        }
    } catch (_) {
        // ignore
    }
    return config;
});

export default api;


