import { useEffect, useState } from "react";
import { Table, Spin, Typography, Tag, Select, Input, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { rootStore } from "../../store/store";
import type { Post } from "../../types/post";
import { observer } from "mobx-react-lite"; 

const { Title } = Typography;
const { Search } = Input;

const UserPosts = observer(() => {
    const { auth } = rootStore;
    const user = auth.user;

    const [loading, setLoading] = useState(true);
    const [allPosts, setAllPosts] = useState<Post[]>([]);

    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    const fetchAll = () => {
        setLoading(true);

        fetch(`https://dummyjson.com/posts`)
            .then(res => res.json())
            .then(data => {
                setAllPosts(data.posts || []);

            })
            .finally(() => {
                setLoading(false);
            });
    };


    const onSearch = (value: string) => {
        if (!value) return fetchAll();

        setLoading(true);

        fetch(`https://dummyjson.com/posts/search?q=${value}`)
            .then(res => res.json())
            .then(data => {
                setAllPosts(data.posts || []);
            })
            .finally(() => {
                setLoading(false);
            });
    };


    useEffect(() => {

        if (!user?.id) return;

        setLoading(true);

        const skip = (pagination.current - 1) * pagination.pageSize;

        let url = `https://dummyjson.com/posts?limit=${pagination.pageSize}&skip=${skip}`;
        console.log(url);


        fetch(url)
            .then(res => res.json())
            .then(data => {
                setAllPosts(data.posts || []);

                setPagination(prev => ({
                    ...prev,
                    total: data.total
                }));
            })
            .finally(() => {
                setLoading(false);
            });

    }, [user, pagination.current, pagination.pageSize]);

    const paginationChange = (p: any) => {
        setPagination(prev => ({
            ...prev,
            current: p.current,
            pageSize: p.pageSize,
        }));
    };

    const languageOptions = [
        { label: "French", value: "french" },
        { label: "English", value: "english" },
        { label: "American", value: "american" },
    ];

    const typeOptions = [
        { label: "History", value: "history" },
        { label: "Crime", value: "crime" },
        { label: "Fiction", value: "fiction" },
        { label: "Magical", value: "magical" },
        { label: "Mystery", value: "mystery" },
        { label: "Love", value: "love" },
        { label: "Classic", value: "classic" },
    ];

    const filteredPosts = allPosts.filter(post => {
        const tags = (post.tags || []).map(t => t.toLowerCase());

        const matchLanguages =
            selectedLanguages.length === 0 ||
            selectedLanguages.some(t => tags.includes(t.toLowerCase()));

        const matchTypes =
            selectedTypes.length === 0 ||
            selectedTypes.some(t => tags.includes(t.toLowerCase()));

        return matchLanguages && matchTypes;
    });

    const columns: ColumnsType<Post> = [
        {
            title: "Post ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            render: (tags: string[] = []) => (
                <div>
                    {tags.map((tag, index) => (
                        <div key={index}>
                            <Tag key={`${tag}-${index}`} color="purple" style={{ marginBottom: 4 }}>
                                {tag}
                            </Tag>
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: "Reactions",
            dataIndex: "reactions",
            key: "reactions",
            render: (r: { likes: number; dislikes: number }) => (
                <div>
                    👍 {r.likes} | 👎 {r.dislikes}
                </div>
            )
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
        <div style={{ padding: 20  }}>
            <Title level={3} style={{ marginBottom: 10, marginTop: 0, color: "white" }}>
                Your Posts
            </Title>

            {/* FILTER BAR */}
            <Space wrap style={{ marginBottom: 16 }}>
                {/* SEARCH */}
                <Search
                    placeholder="Search posts..."
                    onSearch={onSearch}
                    allowClear
                    style={{ width: 250 }}
                />

                <Select
                    mode="multiple"
                    placeholder="Language"
                    style={{ width: 200 }}
                    options={languageOptions}
                    value={selectedLanguages}
                    onChange={setSelectedLanguages}
                />

                <Select
                    mode="multiple"
                    placeholder="Type"
                    style={{ width: 200 }}
                    options={typeOptions}
                    value={selectedTypes}
                    onChange={setSelectedTypes}
                />
            </Space>

            {/* TABLE */}
            <Table
                columns={columns}
                dataSource={filteredPosts}
                rowKey="id"
                bordered
                pagination={pagination}
                expandable={{
                    expandedRowRender: (post) => (
                        <div style={{ paddingLeft: 20 }}>
                            <p style={{ marginBottom: 0 }}>{post.body}</p>
                        </div>
                    ),
                    expandIconColumnIndex: columns.length,
                }}
                onChange={paginationChange}
                scroll={{ y: 400 }}
            />
        </div>
    );
});

export default UserPosts;