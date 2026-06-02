import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Button, Input, Card, Typography, notification } from "antd";
import styles from "./Login.module.css";
import { rootStore } from "../../store/store";

const { Title } = Typography;

export default observer(function Login() {
    const navigate = useNavigate();
    const { auth, activity } = rootStore;
    const { loading, error } = auth;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            await auth.login({ username, password });
            

            activity.addLog({
                action: "LOGIN",
                message: "User logged in",
                meta: { username: auth.user?.username ?? username },
            });

            notification.success({
                message: "Login successfully!",
                description: "You will be redirected to home page.",
            });
            
            navigate("/");
        } catch (err: any) {
            activity.addLog({
                action: "LOGIN_FAILED",
                message: "Login failed",
                meta: { username },
            });

            notification.error({
                message: "Login failed!",
                description: err.message,
            });
            navigate("/login");
        }
    };


    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                <div className={styles.title}>
                    <Title level={3} style={{ color: "white" }}>
                        Sign in to continue
                    </Title>
                </div>

                <Input className={styles.input}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <Input.Password className={styles.input}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    type="primary"
                    onClick={handleLogin}
                    loading={loading}
                    block
                    style={{ marginTop: 5, padding: 20, marginBottom: 30 }}
                >
                    <strong style={{ fontSize: 16 }}> Login </strong>
                </Button>

                {error && (
                    <p style={{ color: "red", marginTop: 10 }}>
                        {error}
                    </p>
                )}
            </Card>
        </div>
    );
})