import { useEffect, useState } from "react";
import { Table, Spin, Typography, Tag, InputNumber, Space } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { rootStore } from "../../store/store";
import { observer } from "mobx-react-lite";
import type { Cart } from "../../types/cart";
import type { Product } from "../../types/product";
import type { PaginationState } from "../../types/paginationstate";

const { Title } = Typography;

const UserCarts = observer(() => {
    const { auth } = rootStore;
    const user = auth.user;

    const [carts, setCarts] = useState<Cart[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [pagination, setPagination] = useState<PaginationState>({
        current: 1,
        pageSize: 5,
        total: 0,
    })

    const { current, pageSize } = pagination;

    const [minPrice, setMinPrice] = useState<number | null>(null);
    const [maxPrice, setMaxPrice] = useState<number | null>(null);

    useEffect(() => {

        if (!user?.id) return;
        
        setLoading(true);

        const skip = (pagination.current - 1) * pagination.pageSize;

        const url = `https://dummyjson.com/carts?limit=${pagination.pageSize}&skip=${skip}`;
        console.log(url);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setCarts(data.carts || []);
                
                setPagination(prev => ({
                    ...prev,
                    total: data.total
                }))
            })
            .finally(() => {
                setLoading(false);
            })
    }, [user, current, pageSize, pagination]);

    const paginationChange = (p: TablePaginationConfig) => {
        setPagination(prev => ({
            ...prev,
            current: p.current ?? prev.current,
            pageSize: p.pageSize ?? prev.pageSize,
        }));
    };

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
            <Title level={3} style={{marginBottom: 10, marginTop: 0, color: "white" }}>
                Your Carts
            </Title>

            <div style={{ marginBottom: 16 }}>
                <Space size="middle" align="center">

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
                pagination={pagination}
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
                                    <span style={{ fontWeight: "bold" }}>{p.title}</span>
                                    <span>
                                        {p.price.toLocaleString()} x {p.quantity} ={" "}
                                        <b>{(p.price * p.quantity).toLocaleString()}</b>
                                        <img
                                            src={p.thumbnail}
                                            alt={p.title}
                                            style={{ width: 50, height: 50, objectFit: "cover", marginLeft: 10 }}
                                        />
                                    </span>
                                </div>
                            ))}
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

export default UserCarts