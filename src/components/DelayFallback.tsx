import { useEffect, useState } from "react";
import { Spin, Skeleton } from "antd";

const DelayedFallback = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(true);
        }, 2000); // delay 2s

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                opacity: visible ? 1 : 0,
                transition: "opacity 0.5s ease",
            }}
        >
            <Spin size="large" />

            <div style={{ width: 250, marginTop: 20 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
            </div>

            {/* Text */}
            <p style={{ color: "#fff", marginTop: 16 }}>
                Đang tải dữ liệu... 
            </p>
        </div>
    );
};

export default DelayedFallback;