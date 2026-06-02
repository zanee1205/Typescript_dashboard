import { useState, useEffect } from "react";
import axios from "axios";
import type { Task } from "../../types/task";
import { Input, Button, List, Typography, Space, Checkbox, Card } from "antd";
import styles from "./TodoPage.module.css";

const { Text } = Typography;

export default function TodoPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [input, setInput] = useState("");

    const fetchTasks = async () => {
        const res = await axios.get("http://localhost:4000/tasks");
        setTasks(res.data);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const addTask = async () => {
        if (!input.trim()) return;
        await axios.post("http://localhost:4000/tasks", {
            title: input,
        });
        setInput("");
        fetchTasks();
    };

    const toggleTask = async (id: number) => {
        await axios.put(`http://localhost:4000/tasks/${id}`);
        fetchTasks();
    };

    const deleteTask = async (id: number) => {
        await axios.delete(`http://localhost:4000/tasks/${id}`);
        fetchTasks();
    };

    return (
        <div className={styles.container}>
            <Card
                title={<span className={styles.cardTitle}>📋 To-Do List</span>}
                className={styles.card}
            >
                <Space.Compact className={styles.inputGroup}>
                    <Input
                        className = {styles.input}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type something awesome..."
                        onPressEnter={addTask}
                    />
                    <Button
                        type="primary"
                        onClick={addTask}
                        className={styles.addBtn}
                    >
                        Add
                    </Button>
                </Space.Compact>

                <List
                    className={styles.list}
                    dataSource={tasks}
                    locale={{ emptyText: "✨ Chưa có task nào" }}
                    renderItem={(task) => (
                        <List.Item
                            className={`${styles.item} ${task.completed ? styles.completed : ""
                                }`}
                            actions={[
                                <Button
                                    danger
                                    type="text"
                                    className={styles.deleteBtn}
                                    onClick={() => deleteTask(task.id)}
                                >
                                    ✕
                                </Button>,
                            ]}
                        >
                            <Space>
                                <Checkbox
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                />
                                <Text style={{ color: "#fff" }} delete={task.completed}>
                                    {task.title}
                                </Text>
                            </Space>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );

}
