import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Avatar, Typography, Button, Form, Input, Space, notification, Popconfirm, Spin, Skeleton, Upload, Progress, Select, DatePicker } from "antd";
import type { UploadProps } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { rootStore } from "../../store/store";
import { observer } from "mobx-react-lite";
import type { User } from "../../types/user";

import dayjs from "dayjs";
import styles from "./ProfileDetail.module.css";

const { Title, Text } = Typography;

type ProfileFormValues = Omit<User, "birthDate"> & {
    birthDate: dayjs.Dayjs | null;
    image?: string;
};

const Home = observer(() => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm<ProfileFormValues>();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loadingImg, setLoadingImg] = useState(false);
    const [percent, setPercent] = useState(0);
    const { auth, activity } = rootStore;

    const user = auth.user;
    const loading = auth.loading;
    const accessToken = auth.accessToken;


    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                ...user,
                birthDate: user.birthDate ? dayjs(user.birthDate) : null
            });
            setImageUrl(user.image);
        }
    }, [user, form]);

    const handleLogout = () => {
        activity.addLog({
            action: "LOGOUT",
            message: "User logged out",
            meta: { username: user?.username }
        });

        auth.logout();

        notification.success({
            message: "Logout successfully!",
            description: "Redirecting to login..."
        });
        navigate("/login");
    };

    const handleSave = (values: ProfileFormValues) => {
        const formattedValues = {
            ...values,
            birthDate: values.birthDate
                ? values.birthDate.format("YYYY-MM-DD")
                : null,
        };

        const logPayload = {
            action: "UPDATE_PROFILE",
            message: "User updated profile",
            meta: { username: user?.username, userId: user?.id },
        };

        console.log("ProfileDetail.handleSave - logging:", logPayload);
        activity.addLog(logPayload);


        if (user) {
            auth.setUser({
                ...user,
                ...formattedValues,
            });
        }

        notification.success({
            message: "Update successfully!",
            description: "Profile updated",
        });
        setIsEditing(false);
    };

    type ProfileUploadRequest = Parameters<NonNullable<UploadProps["customRequest"]>>[0];

    const handleUpload = (options: ProfileUploadRequest) => {
        const file = options.file as RcFile;
        setLoadingImg(true);
        setPercent(0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setPercent(progress);

            if (progress >= 100) {
                clearInterval(interval);

                const url = URL.createObjectURL(file);
                setImageUrl(url);
                form.setFieldValue("image", url);
                // update MobX auth user immediately so header reflects new avatar
                if (user) {
                    auth.setUser({
                        ...user,
                        image: url,
                    });
                }

                activity.addLog({
                    action: "UPDATE_AVATAR",
                    message: "User updated avatar",
                    meta: { username: user?.username, userId: user?.id },
                });

                setLoadingImg(false);
            }
        }, 150);
    };

    useEffect(() => {
        if (!accessToken) {
            navigate("/login");
        }
    }, [accessToken, navigate]);

    if (loading) {
        return (
            <div className={styles.container}>
                <Spin size="large" />
                <div style={{ width: 250, marginTop: 20 }}>
                    <Skeleton active paragraph={{ rows: 3 }} />
                </div>
                <p style={{ color: "#fff", marginTop: 16 }}>
                    Loading...
                </p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <Spin size="large" />
                <div style={{ width: 250, marginTop: 20 }}>
                    <Skeleton active paragraph={{ rows: 3 }} />
                </div>
                <p style={{ color: "#fff", marginTop: 16 }}>
                    Loading...
                </p>
            </div>
        );
    }
    return (
        <div className={styles.RealContainer}>
            <Card
                style={{
                    marginTop: -60,
                    width: 420,
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
            >
                {!isEditing ? (
                    <Space direction="vertical" align="center" style={{ width: "100%" }}>
                        <Avatar size={100} src={user.image} />

                        <Title level={3}>
                            {user?.firstName || "User"} {user.lastName}
                        </Title>

                        <Text type="secondary">{user.maidenName}</Text>

                        <div style={{ width: "100%" }}>
                            <p><b>Age:</b> {user.age}</p>
                            <p><b>Gender:</b> {user.gender}</p>
                            <p><b>Email:</b> {user.email}</p>
                            <p><b>Phone:</b> {user.phone}</p>
                            <p><b>Birth:</b> {user.birthDate}</p>
                            <p><b>User ID:</b> {user.id}</p>
                        </div>

                        <Space>
                            <Button type="primary" onClick={() => setIsEditing(true)}>
                                Edit
                            </Button>

                            <Button type="primary" onClick={() => navigate("/logs")}>
                                User's Logs
                            </Button>

                            <Popconfirm
                                title="Logout"
                                description="Are you sure?"
                                onConfirm={handleLogout}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button danger>Logout</Button>
                            </Popconfirm>
                        </Space>
                    </Space>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                    >
                        <Title level={3} style={{ textAlign: "center", color: "#d50909" }}>
                            <strong>Edit your Profile</strong>
                        </Title>

                        <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[
                                { required: true, message: "Vui lòng nhập First Name" },
                                {
                                    pattern: /^[A-Za-zÀ-ỹ\s]+$/,
                                    message: "Chỉ được nhập chữ, không được chứa số",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[
                                { required: true, message: "Vui lòng nhập Last Name" },
                                {
                                    pattern: /^[A-Za-zÀ-ỹ\s]+$/,
                                    message: "Chỉ được nhập chữ, không được chứa số",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item name="maidenName" label="Maiden Name">
                            <Input />
                        </Form.Item>

                        {/* AGE */}
                        <Form.Item
                            name="age"
                            label="Age"
                            rules={[
                                { required: true, message: "Vui lòng nhập tuổi" },
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        if (isNaN(value)) {
                                            return Promise.reject("Tuổi phải là số");
                                        }
                                        if (Number(value) < 18) {
                                            return Promise.reject("Phải từ 18 tuổi trở lên");
                                        }
                                        if (Number(value) > 95) {
                                            return Promise.reject("Tuổi không hợp lệ");
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        {/* GENDER */}
                        <Form.Item name="gender" label="Gender">
                            <Select placeholder="Select gender">
                                <Select.Option value="male">Male</Select.Option>
                                <Select.Option value="female">Female</Select.Option>
                            </Select>
                        </Form.Item>

                        {/* EMAIL */}
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        {/* PHONE */}
                        <Form.Item
                            name="phone"
                            label="Phone"
                            rules={[
                                { required: true, message: "Vui lòng nhập số điện thoại" },
                                {
                                    pattern: /^[0-9]+$/,
                                    message: "Chỉ được nhập số",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        {/* DATE */}
                        <Form.Item name="birthDate" label="Birth Date">
                            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                        </Form.Item>

                        {/* AVATAR */}
                        <Form.Item label="Avatar">
                            <Upload showUploadList={false} customRequest={handleUpload}>
                                <div
                                    className={styles.uploadImage}
                                    style={{
                                        width: 200,
                                        height: 200,
                                        border: "1px dashed #d9d9d9",
                                        borderRadius: 12,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                    }}
                                >
                                    {loadingImg ? (
                                        <div style={{ textAlign: "center" }}>
                                            <Spin indicator={<LoadingOutlined spin />} />
                                            <Progress percent={percent} />
                                        </div>
                                    ) : imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <PlusOutlined />
                                    )}
                                </div>
                            </Upload>

                            <Form.Item name="image" hidden>
                                <Input />
                            </Form.Item>
                        </Form.Item>

                        {/* BUTTON */}
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={
                                    form
                                        .getFieldsError()
                                        .some((field) => field.errors.length > 0)
                                }
                            >
                                Save
                            </Button>

                            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                        </Space>
                    </Form>
                )}
            </Card>
        </div>
    );
});

export default Home;