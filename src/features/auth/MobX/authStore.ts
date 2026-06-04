import { makeAutoObservable } from "mobx";
import { loginAPI } from "../authAPI";

export class AuthStore {
    root;

    user: any = null;
    accessToken: string | null = null;
    refreshToken: string | null = null;

    loading: boolean = false;
    error: string | null = null;

    constructor(root: any) {
        this.root = root;

        this.accessToken = localStorage.getItem("accessToken");
        this.refreshToken = localStorage.getItem("refreshToken");
        
        makeAutoObservable(this);
    }

    setUser(user: any) {
        this.user = user;
    }

    setAccessToken(token: string) {
        this.accessToken = token;
    }

    setRefreshToken(token: string) {
        this.refreshToken = token;
    }

    async login(data: any) {
        try {
            this.setLoading(true);
            this.setError(null);

            const res = await loginAPI(data.username, data.password);

            const { accessToken, refreshToken, user } = res;

            if (accessToken) {
                this.setAccessToken(accessToken);
                localStorage.setItem("accessToken", accessToken);
            }

            if (refreshToken) {
                this.setRefreshToken(refreshToken);
                localStorage.setItem("refreshToken", refreshToken);
            }

            if (user) {
                this.setUser(user);
            }

            return res;
        } catch (err: any) {
            this.setError(err?.message || "Login failed");
            throw err;
        } finally {
            this.setLoading(false);
        }
    }

    logout() {
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }

    get isAuthenticated() {
        return !!this.accessToken;
    }
    setAuth(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    setLoading(value: boolean) { // ✅ optional nhưng nên có
        this.loading = value;
    }

    setError(message: string | null) { // ✅ optional nhưng nên có
        this.error = message;
    }
}