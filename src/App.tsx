import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DelayedFallback from "./components/DelayFallback";
import { useEffect } from "react";
import { rootStore } from "./store/store";
import { useSession } from "./hooks/useSession";
import { jwtDecode } from "jwt-decode";
import MainLayout from "./MainLayout";
import UserCarts from "./pages/SidebarComponents/UserCarts";
import UserPosts from "./pages/SidebarComponents/UserPosts";
import UserTodo from "./pages/SidebarComponents/UserTodo";
import UserRecipe from "./pages/SidebarComponents/UserRecipe"; 
import UserComments from "./pages/SidebarComponents/UserComments";   

const Login = lazy(() => import("./pages/Secure/Login"));
const Home = lazy(() => import("./pages/Homepage/Home"));
const ActivityLog = lazy(() => import("./pages/ActivityLogs/ActivityPage"));
const TodoPage = lazy(() => import("./pages/To-do/TodoPage"));
const ProfileDetail = lazy(() => import("./pages/ProfileDetail/ProfileDetail"));

function AppContent() {
  useSession();

  const { auth } = rootStore;

  useEffect(() => {
    if (!auth.accessToken || !auth.refreshToken) {
      return;
    }

    try {
      const decoded: any = jwtDecode(auth.accessToken);

      auth.setUser({
        ...decoded,
        id: decoded.sub,
        username: decoded.username,
      });
    } catch {
      auth.logout();
    }
  }, [auth]);

  return (
    <>
      {/* 🌌 BACKGROUND GLOBAL */}
      <div className="bg-future">
        <div className="particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            ></span>
          ))}
        </div>
      </div>

      <Suspense fallback={<DelayedFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/logs" element={<ActivityLog />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/profile" element={<ProfileDetail />} />
            <Route path="/carts" element={<UserCarts />} />
            <Route path="/posts" element={<UserPosts />} />
            <Route path="/todos" element={<UserTodo />} />
            <Route path="/recipe" element={<UserRecipe />} />
            <Route path="/comments" element={<UserComments />} />
          </Route>
        </Routes>
      </Suspense>

      {/* ⚡ EFFECT */}
      <div className="screen-flash"></div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
