import { useEffect, useState } from "react";
import { Table, Spin, Typography, Tag, Checkbox, InputNumber, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { rootStore } from "../../store/store";
import { observer } from "mobx-react-lite";
import type { Cart } from "../../types/cart";
import type { Product } from "../../types/product";

const { Title } = Typography;

const UserCarts = observer(() => {
    const { auth } = rootStore;
    const user = auth.user;
    
    const [carts, setCarts] = useState<Cart[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAll, setIsAll] = useState(false);
    const [minPrice, setMinPrice] = useState<number | null>(null);
    const [maxPrice, setMaxPrice] = useState<number | null>(null);


    useEffect(() => {
        setLoading(true);
        const url = isAll
            ? "https://dummyjson.com/carts"
            : `https://dummyjson.com/users/${user?.id}/carts`;

        if (!user?.id) return;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setCarts(data.carts || []);
            })
            .finally(() => {
                setLoading(false);
            })
    }, [user, isAll]);

    const filteredCarts = carts.filter(cart => {
        const total = cart.total;

        if (minPrice !== null && total < minPrice) return false;
        if (maxPrice !== null && total > maxPrice) return false;
        return true;
    });

    const columns: ColumnsType<Cart> = [
        {
            title: "Cart ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Products",
            dataIndex: "products",
            key: "products",
            render: (products: Product[]) => (
                <div>
                    {products.map((p) => (
                        <div key={p.id}>
                            <Tag color="blue" style={{ marginBottom: 4 }}>
                                {p.title} (x{p.quantity})
                            </Tag>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: "Total Quantity",
            dataIndex: "totalQuantity",
            key: "totalQuantity",
        },
        {
            title: "Total Price",
            dataIndex: "total",
            key: "total",
            render: (total: number) => <b>${total}</b>,
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: 100 }} >
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 20 }}>
            <Title level={3} style={{ marginBottom: 20, color: "white" }}>
                Your Carts
            </Title>

            <div style={{ marginBottom: 16 }}>
                <Space size="middle" align="center">
                    {/* ALL ORDERS */}
                    <Checkbox
                        checked={isAll}
                        style = {{ color: "white" }}
                        onChange={(e) => setIsAll(e.target.checked)}
                    >
                        All Orders
                    </Checkbox>

                    {/* MIN PRICE */}
                    <InputNumber
                        placeholder="Min $"
                        value={minPrice ?? undefined}
                        onChange={(value) => setMinPrice(value ?? null)}
                        style={{ width: 120 }}
                    />

                    {/* MAX PRICE */}
                    <InputNumber
                        placeholder="Max $"
                        value={maxPrice ?? undefined}
                        onChange={(value) => setMaxPrice(value ?? null)}
                        style={{ width: 120 }}
                    />
                </Space>
            </div>

            {/* TABLE */}
            <Table
                columns={columns}
                dataSource={filteredCarts}
                rowKey="id"
                bordered
                pagination={{ pageSize: 5 }}
                expandable={{
                    expandedRowRender: (cart) => (
                        <div style={{ paddingLeft: 20 }}>
                            {cart.products.map((p) => (
                                <div
                                    key={p.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "6px 0",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    <span>{p.title}</span>
                                    <span>
                                        ${p.price} x {p.quantity} ={" "}
                                        <b>${p.price * p.quantity}</b>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ),
                    expandIconColumnIndex: columns.length,
                }}
            />
        </div>
    );
});

export default UserCarts