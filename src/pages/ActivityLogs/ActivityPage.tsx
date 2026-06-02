import { List, Card, Typography, Tag, Button, Space, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import { rootStore } from "../../store/store";
import { observer } from "mobx-react-lite";

const { Title, Text } = Typography;

const ActivityPage = observer(() => {
    const navigate = useNavigate();
    const { activity } = rootStore;
    const logs = activity.logs;

    const handleReset = () => {
        activity.clearLogs();
    };

    return (
        <Card style={{ maxWidth: 800, margin: "auto", marginTop: 40, color: "black" }}>
            
            <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
                <Title level={3} style={{ margin: 0 }}>
                    Activity Logs
                </Title>

                <Space>
                    <Button onClick={() => navigate(-1)}>
                        ⬅ Back
                    </Button>

                    <Popconfirm
                        title="Are you sure to delete all logs?"
                        onConfirm={handleReset}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger>
                            Reset data
                        </Button>
                    </Popconfirm>
                </Space>
            </Space>

            <List
                dataSource={[...logs].reverse()}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            title={
                                <>
                                    <Text strong>{item.message}</Text>

                                    {item.meta?.username && (
                                        <Tag color="blue" style={{ marginLeft: 10 }}>
                                            {item.meta.username}
                                        </Tag>
                                    )}
                                </>
                            }
                            description={item.time}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
});

export default ActivityPage;