export interface Activity {
    id: string;
    message: string;
    action: string;
    time: string;
    meta?: {
        username?: string;
        [key: string]: any;
    };
}

export interface ActivityState {
    logs: Activity[];
}