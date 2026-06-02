// //Redux Toolkit

// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "../features/auth/authSlice";
// import activityReducer from "../features/auth/activitySlice";

// export const store = configureStore({
//     reducer: {
//         auth: authReducer,
//         activity: activityReducer,
//     },
// });

// export type RootState = ReturnType<typeof store.getState>

import { AuthStore } from "../features/auth/MobX/authStore";
import { ActivityStore } from "../features/auth/MobX/activityStore";

export class RootStore {
    auth: AuthStore;
    activity: ActivityStore;

    constructor() {
        this.auth = new AuthStore(this);
        this.activity = new ActivityStore(this);
    }
}

export const rootStore = new RootStore();