import { useEffect, useState } from "react";
import { Table, Spin, Typography, Tag, Space, Checkbox, Button, Select } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { rootStore } from "../../store/store";
import { observer } from "mobx-react-lite";
import type { Todo } from "../../types/todo";

const { Title } = Typography;

const UserTodo = observer(() => {
    const { auth } = rootStore;
    const user = auth.user;

    const [allTodos, setAllTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAll, setIsAll] = useState(false);
    const [rolling, setRolling] = useState(false);
    const [randomTodo, setRandomTodo] = useState<Todo | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<boolean[]>([]);

    const rollRandomTodo = () => {
        setRolling(true);
        setRandomTodo(null);

        setTimeout(() => {
            fetch("https://dummyjson.com/todos/random")
                .then(res => res.json())
                .then(data => {
                    setRandomTodo(data);
                })
                .finally(() => {
                    setRolling(false);
                });
        }, 700);
    };

    const fetchAll = () => {
        setLoading(true);

        fetch(`https://dummyjson.com/todos`)
            .then(res => res.json())
            .then(data => {
                setAllTodos(data.todos || []);
                setLoading(false);
            });
    };
    fetchAll;
    useEffect(() => {
        if (!user?.id) return;

        setLoading(true);

        const url = isAll
            ? "https://dummyjson.com/todos"
            : `https://dummyjson.com/users/${user.id}/todos`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setAllTodos(data.todos || []);
                setLoading(false);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user, isAll]);

    const filteredTodos = allTodos.filter(todo => {
        if (selectedStatus.length === 0) return true;
        return selectedStatus.includes(todo.completed);
    });

    const columns: ColumnsType<Todo> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Todo",
            dataIndex: "todo",
            key: "todo",
        },
        {
            title: "Status",
            dataIndex: "completed",
            key: "completed",
            render: (completed: boolean) =>
                completed ? (
                    <Tag color="green">Done</Tag>
                ) : (
                    <Tag color="orange">In Progress</Tag>
                ),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: 100 }}>
                <Spin size="large" />
            </div>
        )
    }

    return (
        <div style={{ padding: 20 }}>
            <Title level={3} style={{ marginBottom: 20, color: "white" }}>
                Your Todos
            </Title>

            <Space wrap style={{ marginBottom: 16, alignItems: "center" }}>
                <Checkbox
                    checked={isAll}
                    onChange={(e) => setIsAll(e.target.checked)}
                    style={{ color: "white" }}
                >
                    All Todos
                </Checkbox>
                <Select
                    mode="multiple"
                    placeholder="Choose status"
                    style={{ width: 210 }}
                    options={[
                        { value: true, label: "Done" },
                        { value: false, label: "In Progress" },
                    ]}
                    value={selectedStatus}
                    onChange={(value) => setSelectedStatus(value)}
                />

                {/* BUTTON */}
                <Button type="primary" onClick={rollRandomTodo}>
                    <ReloadOutlined className={rolling ? "dice-spin" : ""} />
                    Roll Todo
                </Button>

                {/* RESULT INLINE */}
                <div className="dice-inline">
                    {rolling ? (
                        <span className="dice-box">🎲</span>
                    ) : randomTodo ? (
                        <span>
                            🎯 <b>{randomTodo.todo}</b>
                        </span>
                    ) : (
                        <span style={{ color: "#aaa" }}>No random yet</span>
                    )}
                </div>
            </Space>

            <Table
                columns={columns}
                dataSource={filteredTodos}
                rowKey="id"
                bordered
                pagination={{ pageSize: 5 }}
            />
        </div>
    )

})

export default UserTodo