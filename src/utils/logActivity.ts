import { store } from "../store/store";
import { addLog } from "../features/auth/activitySlice";

export const logActivity = (message: string, meta?: any) => {
    const action = typeof meta?.action === "string" ? meta.action : "SYSTEM";

    store.dispatch(
        addLog({
            action,
            message,
            meta,
        })
    );

};