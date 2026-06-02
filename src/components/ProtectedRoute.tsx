import { Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { rootStore } from "../store/store";

const { auth } = rootStore;

const ProtectedRoute = observer(({ children }: any) => {
    if (auth.loading) return <div>Loading...</div>;

    if (!auth.accessToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
});

export default ProtectedRoute;