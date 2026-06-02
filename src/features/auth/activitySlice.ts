import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Activity, ActivityState } from "../../types/activity";

const storedLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]") as Activity[];

// ===== Initial State =====
const initialState: ActivityState = {
    logs: storedLogs,
};

type AddLogPayload = Omit<Activity, "id" | "time">;

// ===== Slice =====
const activitySlice = createSlice({
    name: "activity",
    initialState,
    reducers: {
        addLog: (state, action: PayloadAction<AddLogPayload>) => {
            const newLog: Activity = {
                id: Date.now().toString(),
                time: new Date().toISOString(),
                ...action.payload,
            };

            state.logs.unshift(newLog);
            localStorage.setItem("activityLogs", JSON.stringify(state.logs));
        },

        clearLogs: (state) => {
            state.logs = [];
            localStorage.setItem("activityLogs", JSON.stringify(state.logs));
        },
    },
});

export const { addLog, clearLogs } = activitySlice.actions;
export default activitySlice.reducer;