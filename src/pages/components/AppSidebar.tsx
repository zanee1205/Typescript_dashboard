import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, PieChartOutlined, DesktopOutlined, ContainerOutlined, SettingOutlined, ShoppingCartOutlined, AliwangwangOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

type MenuItem = Required<MenuProps>["items"][number];

const SIDEBAR_WIDTH = 256;
const COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 80;

const AppSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const items: MenuItem[] = [
    { key: "/carts", icon: <ShoppingCartOutlined />, label: "User's Carts", onClick: () => navigate("/carts") },
    { key: "/posts", icon: <DesktopOutlined />, label: "User's Posts", onClick: () => navigate("/posts") },
    { key: "/todos", icon: <ContainerOutlined />, label: "User Todos", onClick: () => navigate("/todos") },
    { key: "/recipe", icon: <PieChartOutlined />, label: "User's Recipe", onClick: () => navigate("/recipe") },
    { key: "/comments", icon: <AliwangwangOutlined />, label: "User's Comments", onClick: () => navigate("/comments") },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
      children: [
        { key: "profile", label: "Edit Profile" },
        { key: "todo", label: "Todo List" },
        { key: "logs", label: "Activity Log" },
      ],
    },
  ];

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        `${collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH}px`
      );
    }
  }, [collapsed]);

  const sidebarElement = (
    <div
      style={{
        position: "fixed",
        top: HEADER_HEIGHT,
        left: 0,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        background: "#001529",
        transition: "all 0.3s",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >

      <div style={{ padding: 10 }}>
        <Button
          type="primary"
          onClick={() => setCollapsed(!collapsed)}
          style={{ width: "100%" }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
      </div>

      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        items={items}
        style={{ flex: 1 }}
        onClick={({ key }) => navigate(key as string)}
      />
    </div>
  );

  return (
    <>
      {sidebarElement}
    </>
  );
};

export default AppSidebar;