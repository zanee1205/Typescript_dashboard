import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI } from "./authAPI";
import type { AuthState } from "../../types/authstate";

// ================= LOGIN =================
export const login = createAsyncThunk(
    "auth/login",
    async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await loginAPI(username, password);
            return res;
        } catch (err: unknown) {
            if (err && typeof err === "object" && "response" in err) {
                const typedErr = err as { response?: { data?: unknown } };
                return rejectWithValue(typedErr.response?.data ?? "Login failed");
            }

            return rejectWithValue(err instanceof Error ? err.message : "Login failed");
        }
    }
);

// ================= INITIAL STATE =================
const initialState: AuthState = {
    user: null,
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    loading: false,
    error: null,
};

// ================= SLICE =================
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },

        updateToken: (state, action) => {
            state.accessToken = action.payload;
            localStorage.setItem("accessToken", action.payload);
        },

        updateUser: (state, action) => {
            state.user = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder
            // ===== LOGIN =====
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;

                const { accessToken, refreshToken, user } = action.payload;

                state.accessToken = accessToken;
                state.refreshToken = refreshToken;
                state.user = user;

                if (accessToken) {
                    localStorage.setItem("accessToken", accessToken);
                }

                if (refreshToken) {
                    localStorage.setItem("refreshToken", refreshToken);
                }
            })

            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout, updateToken, updateUser } = authSlice.actions;
export default authSlice.reducer;