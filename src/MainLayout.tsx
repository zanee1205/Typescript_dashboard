import AppHeader from "./pages/components/AppHeader";
import AppSidebar from "./pages/components/AppSidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <AppHeader />
      <AppSidebar />
      <div
        className="app-container"
        style={{ paddingTop: 80, marginLeft: "var(--sidebar-width, 256px)" }}
      >
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;