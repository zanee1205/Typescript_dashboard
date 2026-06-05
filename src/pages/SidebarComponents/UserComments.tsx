import { useState } from "react";
import { Table, Spin, Typography, Tag, Input, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import type { Comment } from "../../types/comment";

const { Title } = Typography;
const { Search } = Input;

const fetchComments = async (
  page: number,
  limit: number,
  search: string
): Promise<{ data: Comment[]; total: number }> => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/comments?_page=${page}&_limit=${limit}`
  );

  const total = Number(res.headers.get("x-total-count")) || 0;
  const data: Comment[] = await res.json();

  const filtered = search
    ? data.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return { data: filtered, total };
};

export default function UserComments() {
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["comments", pagination.current, pagination.pageSize, search],
    queryFn: () =>
      fetchComments(
        pagination.current,
        pagination.pageSize,
        search
      ),
    placeholderData: (prev) => prev
  });

  const columns: ColumnsType<Comment> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Tag color="blue">{email}</Tag>,
    },
    {
      title: "Post ID",
      dataIndex: "postId",
      key: "postId",
      render: (id: number) => <Tag color="purple">{id}</Tag>,
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={3} style={{ marginBottom: 10, marginTop: 0, color: "white" }}>
        Comments
      </Title>

      <Space wrap style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search by name or email..."
          allowClear
          onSearch={(value) => {
            setPagination((prev) => ({ ...prev, current: 1 })); // reset page
            setSearch(value);
          }}
          style={{ width: 300 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        bordered
        loading={isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data?.total || 0,
        }}
        onChange={(p) =>
          setPagination({
            current: p.current || 1,
            pageSize: p.pageSize || 5,
          })
        }
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ paddingLeft: 20 }}>
              <p style={{ marginBottom: 0 }}>{record.body}</p>
            </div>
          ),
        }}
        scroll={{ y: 400 }}
      />
    </div>
  );
}