import axios from "axios";



const API_BASE = process.env.REACT_APP_API_BASE;



if (!API_BASE) {

    console.warn("⚠️ REACT_APP_API_BASE is not set in .env file!");

}



export const api = axios.create({

    baseURL: API_BASE,

    headers: {

        "Content-Type": "application/json",

        Accept: "application/json",

        "ngrok-skip-browser-warning": "true", // Required for ngrok free tier

    },

});



api.interceptors.request.use((config) => {

    try {

        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        const locale = localStorage.getItem("locale") || navigator.language?.slice(0, 2) || "en";



        // Ensure ngrok header is always present

        config.headers = config.headers || {};

        config.headers["ngrok-skip-browser-warning"] = "true";



        // If data is FormData and Content-Type is not explicitly set, remove default JSON Content-Type

        // to let axios set it automatically with boundary

        if (config.data instanceof FormData) {

            if (config.headers['Content-Type'] === 'application/json') {

                delete config.headers['Content-Type'];

            }

        }



        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }

        if (locale) {

            config.headers["X-localization"] = locale;

        }



    } catch (_) {

        // ignore

    }

    return config;

});



// Response interceptor for error handling

api.interceptors.response.use(

    (response) => response,

    (error) => {

        // Handle 401 Unauthorized - token expired or invalid

        if (error.response?.status === 401) {

            console.error("Authentication error:", error.response);

            try {

                localStorage.removeItem("authToken");

                localStorage.removeItem("user");

                sessionStorage.removeItem("authToken");

                sessionStorage.removeItem("user");

            } catch (_) {}

        }

        // Handle 403 Forbidden - insufficient permissions

        if (error.response?.status === 403) {

            console.error("Permission denied:", error.response);

        }

        // Log other errors for debugging

        if (error.response) {

            console.error("❌ API Error:", {

                status: error.response.status,

                statusText: error.response.statusText,

                data: error.response.data,

                url: error.config?.baseURL + error.config?.url,

                headers: error.config?.headers,

            });

        } else if (error.request) {

            console.error("❌ Network Error - No response received:", {

                url: error.config?.baseURL + error.config?.url,

                message: error.message,

            });

        } else {

            console.error("❌ Request Setup Error:", error.message);

        }

        return Promise.reject(error);

    }

);



export default api;





