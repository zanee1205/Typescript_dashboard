import { useEffect, useState } from "react";
import { Table, Spin, Typography, Tag, Space, Button, Select } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { rootStore } from "../../store/store";
import { observer } from "mobx-react-lite";
import type { Todo } from "../../types/todo";
import type { TablePaginationConfig } from "antd/es/table";

const { Title } = Typography;

const UserTodo = observer(() => {
    const { auth } = rootStore;
    const user = auth.user;

    const [allTodos, setAllTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [rolling, setRolling] = useState(false);
    const [randomTodo, setRandomTodo] = useState<Todo | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<boolean[]>([]);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    })

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

    useEffect(() => {
        if (!user?.id) return;

        setLoading(true);

        const isFiltering = selectedStatus.length > 0;
        const skip = (pagination.current - 1) * pagination.pageSize;
        const url = isFiltering
            ? `https://dummyjson.com/todos`
            : `https://dummyjson.com/todos?limit=${pagination.pageSize}&skip=${skip}`;

        console.log(url);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const todos = data.todos || [];

                if (isFiltering) {
                    const filtered = todos.filter((todo: Todo) =>
                        selectedStatus.includes(todo.completed)
                    );

                    setAllTodos(filtered);

                    setPagination(prev => ({
                        ...prev,
                        total: data.total
                    }));
                } else {
                    setAllTodos(todos);

                    setPagination(prev => ({
                        ...prev,
                        total: data.total
                    }))
                }
            })
            .finally(() => setLoading(false));

    }, [user, pagination.current, pagination.pageSize, selectedStatus]);


    const paginationChange = (p: TablePaginationConfig) => {
        setPagination(prev => ({
            ...prev,
            current: p.current || 1,
            pageSize: p.pageSize || 5,
        }));
    };

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
            <Title level={3} style={{ marginBottom: 10, marginTop: 0, color: "white" }}>
                Your Todos
            </Title>

            <Space wrap style={{ marginBottom: 16, alignItems: "center" }}>
                <Select
                    mode="multiple"
                    placeholder="Choose status"
                    style={{ width: 150 }}
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
                dataSource={allTodos}
                rowKey="id"
                bordered
                pagination={pagination}
                onChange={paginationChange}
                scroll={{ y: 400 }}
            />
        </div>
    )

})

export default UserTodo