import axios from "axios";
import { notification } from "antd";
import { rootStore } from "../store/store";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const handleSessionExpired = () => {
    rootStore.auth.logout();
    notification.error({
        message: "Session expired",
        description: "Your login session has expired. Please sign in again.",
    });
    window.location.href = "/login";
};

axiosClient.interceptors.request.use((config) => {
    const token = rootStore.auth.accessToken || localStorage.getItem("accessToken");

    if (token && !config.url?.includes("/auth/login") && !config.url?.includes("/auth/refresh")) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

axiosClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isAuthEndpoint = ["/auth/login", "/auth/refresh"].some((path) => originalRequest.url?.includes(path));

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            const refreshToken = rootStore.auth.refreshToken || localStorage.getItem("refreshToken");

            if (!refreshToken) {
                handleSessionExpired();
                return Promise.reject(error);
            }

            if (isRefreshing && refreshPromise) {
                try {
                    const refreshedAccessToken = await refreshPromise;
                    if (refreshedAccessToken) {
                        originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
                        return axiosClient(originalRequest);
                    }
                } catch (refreshError) {
                    handleSessionExpired();
                    return Promise.reject(refreshError);
                }
            }

            isRefreshing = true;

            refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
            })
                .then((res) => {
                    const newAccessToken = res.data.accessToken;

                    rootStore.auth.setAuth(newAccessToken, refreshToken);

                    return newAccessToken;
                })
                .catch((refreshError) => {
                    handleSessionExpired();
                    throw refreshError;
                })
                .finally(() => {
                    isRefreshing = false;
                    refreshPromise = null;
                });

            try {
                const newAccessToken = await refreshPromise;

                if (newAccessToken) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;