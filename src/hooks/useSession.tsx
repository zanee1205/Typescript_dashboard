import { useEffect, useRef } from "react";
import { Modal } from "antd";
import { useLocation } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { getTokenEXP } from "../utils/tokenService";
import { rootStore } from "../store/store";

export const useSession = () => {
    const refreshTimeoutRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);
    const warningTimeoutRef = useRef<number | null>(null);
    const isRefreshing = useRef(false);
    const modalRef = useRef<any>(null);
    const { pathname } = useLocation();
    const isLoginPage = pathname === "/login";
    const { auth } = rootStore;
    const { accessToken, refreshToken } = auth;


    const clearAllTimers = () => {
        if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

        refreshTimeoutRef.current = null;
        countdownRef.current = null;
        warningTimeoutRef.current = null;

        Modal.destroyAll();
        modalRef.current = null;
    };

    const logout = () => {
        clearAllTimers();
        auth.logout();
        window.location.href = "/login";
    };

    const showSessionExpiredModal = () => {
        Modal.destroyAll();

        modalRef.current = Modal.error({
            title: "Session expired",
            content: "Please login again",
            centered: true,
            closable: false,
            maskClosable: false,
            okText: "Login",
            onOk: logout,
        });
    };

    const showRefreshingLog = () => {
        console.info("🔄 [SESSION] Refreshing access token...");
    };

    const startCountdown = (exp: number) => {
        if (countdownRef.current) clearInterval(countdownRef.current);

        countdownRef.current = window.setInterval(() => {
            const timeLeft = Math.max(
                0,
                Math.floor((exp - Date.now()) / 1000)
            );

            console.log("⏳ access token:", timeLeft, "s");

            if (timeLeft <= 0 && countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        }, 1000);
    };

    const refreshSessionToken = async (refreshTokenValue: string) => {
        if (isRefreshing.current) return;
        isRefreshing.current = true;

        try {
            const res = await axiosClient.post("/auth/refresh", {
                refreshToken: refreshTokenValue,
            });

            const newAccessToken = res.data.accessToken;

            auth.setAuth(newAccessToken, refreshTokenValue);

            scheduleSession(newAccessToken);
        } catch {
            clearAllTimers();
            showSessionExpiredModal();
        } finally {
            isRefreshing.current = false;
        }
    };
    const scheduleSession = (tokenFromRedux?: string) => {
        clearAllTimers();

        const token = tokenFromRedux || accessToken;

        if (!token) return;

        const accessExp = getTokenEXP(token);

        const now = Date.now();

        startCountdown(accessExp);

        const refreshTokenValue = refreshToken;

        if (!refreshTokenValue) return;

        const refreshExp = getTokenEXP(refreshTokenValue);

        const refreshDelay = accessExp - 2000 - now;

        if (refreshDelay <= 0) {
            showRefreshingLog();
            refreshSessionToken(refreshTokenValue);
        } else {
            refreshTimeoutRef.current = window.setTimeout(() => {
                showRefreshingLog();
                refreshSessionToken(refreshTokenValue);
            }, refreshDelay);
        }

        const warningDelay = refreshExp - 2 * 60 * 1000 - now;

        if (warningDelay > 0) {
            warningTimeoutRef.current = window.setTimeout(() => {

                let seconds = 120;
                const modal = Modal.warning({
                    title: "🚨 CẢNH BÁO KHẨN CẤP 🚨",
                    icon: null,
                    width: 800,
                    centered: true,
                    className: "danger-modal",
                    content: (
                        <div className="danger-content">
                            ⚠️ PHIÊN ĐĂNG NHẬP HẾT HẠN SAU {seconds}s ⚠️
                            <br />
                            HÃY LƯU DỮ LIỆU NGAY !!!
                        </div>
                    ),
                    closable: false,
                    maskClosable: false,
                });

                const interval = setInterval(() => {
                    seconds--;

                    modal.update({
                        content: (
                            <div className="danger-content">
                                ⚠️ PHIÊN ĐĂNG NHẬP HẾT HẠN SAU {seconds}s ⚠️
                                <br />
                                HÃY LƯU DỮ LIỆU NGAY !!!
                            </div>
                        ),
                    });

                    if (seconds <= 0) {
                        clearInterval(interval);
                    }
                }, 1000);

            }, warningDelay);
        }
    };

    // ================= EFFECT =================

    useEffect(() => {
        if (!accessToken) {
            clearAllTimers();
            return;
        }

        if (isLoginPage) return;

        scheduleSession(accessToken);

        return () => clearAllTimers();
    }, [accessToken, refreshToken, pathname, isLoginPage]);

};