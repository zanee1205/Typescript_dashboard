import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const loginAPI = async (username: string, password: string) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
    });
    return res.data;
};