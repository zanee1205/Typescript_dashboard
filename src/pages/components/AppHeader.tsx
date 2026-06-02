import { Layout, Avatar, Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    ProfileOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import styles from "./AppHeader.module.css";
import { rootStore } from "../../store/store";

const { Header } = Layout;

function AppHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth, activity } = rootStore;

    const user = auth.user;
    const userMenu: MenuProps["items"] = [
        {
            key: "user",
            label: <strong style={{ color: "black" }}>{user?.username}</strong>,
            disabled: true,
        },
        {
            type: "divider",
        },
        { type: "divider" },
        {
            key: "profile",
            icon: <ProfileOutlined />,
            label: "Profile",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            danger: true,
        },
    ];

    const isLoginPage = location.pathname === "/login";
    const isLoggedIn = !!user;

    const MenuItem = [
        { key: "/", label: "Home" },
        { key: "/todo", label: "To-Do" },
        { key: "/logs", label: "Activity" },
    ];


    const handleMenuClick = ({ key }: any) => {
        if (key === "profile") navigate("/profile");

        if (key === "logout") {
            activity.addLog({
                action: "LOGOUT",
                message: "User logged out",
                meta: { username: user?.username, userId: user?.id },
            });

            auth.logout();
            navigate("/login");
        }
    };

    return (
        <Header className={styles.appHeader}>
            {/* LOGO */}
            <div className={styles.logo}>🔥 MyApp</div>

            {/* 👉 KHÔNG PHẢI LOGIN PAGE + ĐÃ LOGIN */}
            {!isLoginPage && isLoggedIn && (
                <div className={styles.nav}>
                    {MenuItem.map((item) => {
                        const isActive = location.pathname === item.key;

                        return (
                            <div
                                key={item.key}
                                className={clsx(styles.navItem, {
                                    [styles.active]: isActive,
                                })}
                                onClick={() => navigate(item.key)}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* RIGHT */}
            <div className={styles.userBox}>
                {/* 👉 TRANG LOGIN */}
                {isLoginPage && (
                    <span className={styles.loginHint}>
                        Đăng nhập để tiếp tục
                    </span>
                )}

                {!isLoginPage && !isLoggedIn && (
                    <Tooltip title="Đăng nhập để tiếp tục">
                        <Avatar
                            icon={<UserOutlined />}
                            onClick={() => navigate("/login")}
                            className={styles.avatar}
                        />
                    </Tooltip>
                )}

                {/* 👉 ĐÃ LOGIN */}
                {isLoggedIn && !isLoginPage && (
                    <Dropdown
                        menu={{
                            items: userMenu,
                            onClick: handleMenuClick,
                        }}
                        placement="topRight"
                        getPopupContainer={() => document.body}
                        overlayStyle={{ zIndex: 1300 }}
                    >
                        <div className={styles.userInfo}>
                            <Avatar
                                style={{ backgroundColor: "#b0d9ff" }}
                                src={user?.image} 
                                icon={!user?.image && <UserOutlined />}
                            />
                            <span style={{ color: "white" }}>{user?.username}</span>
                        </div>
                    </Dropdown>
                )}
            </div>
        </Header>
    );
}

export default observer(AppHeader);