import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Logins";
import SignUp from "../pages/SignUp";
import MapContainerComponent from "../componentes/mapas/MapContainerComponent";
import AdminPanel from "../pages/AdminPanel";
import InspectorPage from "../pages/InspectorPanel";
import PasajeroPage from "../componentes/mapas/MapContainerComponent";
import NoAutorizado from "../pages/NoAutorizado";
import ChoferPanel from "../pages/choferPanel";
import AdminHeader from "../componentes/admin/AdminHeader";
import Dashboard from "../pages/Dashboard";

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};

/* ================= ROUTER ================= */
const AppRouter = () => {
  //console.log("APP ROUTER CARGADO");

  return (
    <Routes>
      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />
   

      {/* POR ROL */}
      <Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <Dashboard />
    </ProtectedRoute>
  }
/>

      <Route
        path="/inspector"
        element={
          <ProtectedRoute allowedRoles={["INSPECTOR"]}>
            <InspectorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chofer"
        element={
          <ProtectedRoute allowedRoles={["CHOFER"]}>
            <ChoferPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pasajero"
        element={
          <ProtectedRoute allowedRoles={["PASAJERO"]}>
            <PasajeroPage />
          </ProtectedRoute>
        }
      />

      {/* PÚBLICO */}
      <Route path="/" element={
       <div style={{ height: "100vh", width: "100vw" }}>
         <AdminHeader/>
         <MapContainerComponent />
       </div>
        }/>
      <Route path="/mapa" element={
        <div style={{ height: "100vh", width: "100vw" }}>
          <AdminHeader/>
         <MapContainerComponent />
        </div>
        }/>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;
