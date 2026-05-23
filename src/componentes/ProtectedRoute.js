import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

  if (!user || !user.token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/no-autorizado" />;
  }

  return children;
};

export default ProtectedRoute;
