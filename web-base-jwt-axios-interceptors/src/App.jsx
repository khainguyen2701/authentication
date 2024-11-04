import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "~/pages/Login";
import Dashboard from "~/pages/Dashboard";

const ProtectedRoutes = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo) {
    return <Navigate to="/login" replace={true} />;
  }
  return <Outlet />;
};

const AuthorizedRoutes = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (userInfo) {
    return <Navigate to="/dashboard" replace={true} />;
  }
  return <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace={true} />} />
      <Route element={<AuthorizedRoutes />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
