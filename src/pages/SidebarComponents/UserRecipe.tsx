import { useEffect, useState } from "react";
import { Table, Spin, Typography, Tag, Select, Space, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { rootStore } from "../../store/store";
import { observer } from "mobx-react-lite";
import type { Recipe } from "../../types/recipe";

const { Title } = Typography;
const { Search } = Input;

const UserRecipe = observer(() => {
    const { auth } = rootStore;
    const user = auth.user;

    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    })

    const [selectedCuisine, setSelectedCuisine] = useState<string[]>([]);
    const [selectedMeal, setSelectedMeal] = useState<string[]>([]);
    const [search, setSearch] = useState('');

    const onSearch = (value: string) => {
        setSearch(value);
        setPagination(prev => ({
            ...prev,
            current: 1
        }));
    };

    useEffect(() => {

        if (!user?.id) return;

        setLoading(true);

        const skip = (pagination.current - 1) * pagination.pageSize;

        let url = search
            ? `https://dummyjson.com/recipes/search?q=${search}`
            : `https://dummyjson.com/recipes?limit=${pagination.pageSize}&skip=${skip}`;
        console.log(url);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setRecipes(data.recipes || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.total
                }));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user, pagination.current, pagination.pageSize, search]);

    const paginationChange = (p: any) => {
        setPagination(prev => ({
            ...prev,
            current: p.current,
            pageSize: p.pageSize || 5
        }))
    }

    const filteredRecipes = recipes.filter((recipe) => {
        const matchCuisine =
            selectedCuisine.length === 0 ||
            selectedCuisine.includes(recipe.cuisine.toLowerCase());

        const matchMeal =
            selectedMeal.length === 0 ||
            recipe.mealType.some(meal =>
                selectedMeal.includes(meal.toLowerCase())
            );

        return matchCuisine && matchMeal;
    });

    const mealOption = [
        { label: "Dinner", value: "dinner" },
        { label: "Lunch", value: "lunch" },
        { label: "Snack", value: "snack" },
        { label: "Dessert", value: "dessert" },
        { label: "Side Dish", value: "side-dish" },
        { label: "Breakfast", value: "breakfast" },
    ];

    const cuisineOption = [
        { label: "Italian", value: "italian" },
        { label: "Asian", value: "asian" },
        { label: "American", value: "american" },
        { label: "Mexican", value: "mexican" },
        { label: "Mediterranean", value: "mediterranean" },
        { label: "Pakistani", value: "pakistani" },
        { label: "Japanese", value: "japanese" },
        { label: "Moroccan", value: "moroccan" },
        { lebel: "Korean", value: "korean" },
        { label: "Greek", value: "greek" },
        { label: "Thai", value: "thai" },
        { label: "Turkish", value: "turkish" },
        { label: "Russian", value: "russian" },
        { label: "Lebanese", value: "lebanese" },
        { label: "Brazilian", value: "brazilian" },
    ];

    const columns: ColumnsType<Recipe> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
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
            title: "Cuisine",
            dataIndex: "cuisine",
            key: "cuisine",
        },
        {
            title: "Meal Type",
            dataIndex: "mealType",
            key: "mealType",
            render: (mealType: string[] = []) => (
                <div>
                    {mealType.map((meal, index) => (
                        <div key={index}>
                            <Tag key={`${meal}-${index}`} color="green" style={{ marginBottom: 4 }}>
                                {meal}
                            </Tag>
                        </div>
                    ))}
                </div>
            )
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 20 }}>
            <Title level={3} style={{ marginBottom: 10, marginTop: 0, color: "white" }}>
                Your Food Recipes
            </Title>

            <div>
                <Space wrap style={{ marginBottom: 16 }}>
                    <Search
                        placeholder="Search Food Recipes..."
                        onSearch={onSearch}
                        allowClear
                        style={{ width: 250 }}
                    />
                    <Select
                        mode="multiple"
                        placeholder="Cuisine"
                        style={{ width: 200 }}
                        options={cuisineOption}
                        value={selectedCuisine}
                        onChange={setSelectedCuisine}
                    />
                    <Select
                        mode="multiple"
                        placeholder="Meal Type"
                        style={{ width: 200 }}
                        options={mealOption}
                        value={selectedMeal}
                        onChange={setSelectedMeal}
                    />
                </Space>

                <Table
                    columns={columns}
                    dataSource={filteredRecipes}
                    pagination={pagination}
                    onChange={paginationChange}
                    scroll={{ y: 400 }}
                />
            </div>
        </div>
    );

});
export default UserRecipe