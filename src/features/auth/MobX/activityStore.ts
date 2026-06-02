import { makeAutoObservable } from "mobx";
import type { Activity } from "../../../types/activity";
import type { RootStore } from "../../../store/store";

type AddLogPayload = Omit<Activity, "id" | "time">;
export class ActivityStore {
  root: RootStore;

  logs: Activity[] = [];

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);

    // load từ localStorage
    const storedLogs = localStorage.getItem("activityLogs");
    this.logs = storedLogs ? JSON.parse(storedLogs) : [];
  }

  // ✅ thêm log
  addLog(payload: AddLogPayload) {
    const newLog: Activity = {
      id: Date.now().toString(),
      time: new Date().toISOString(),
      ...payload,
    };

    this.logs.unshift(newLog);

    this.saveToLocalStorage();
  }

  // ✅ clear logs
  clearLogs() {
    this.logs = [];
    this.saveToLocalStorage();
  }

  // 🔒 private helper
  private saveToLocalStorage() {
    localStorage.setItem("activityLogs", JSON.stringify(this.logs));
  }
}