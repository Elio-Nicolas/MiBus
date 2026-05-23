import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole =
      localStorage.getItem("role") ||
      sessionStorage.getItem("role");

    setRole(storedRole);
  }, []);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) return null;

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
    window.location.reload(); // 🔴 clave
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/home")}>
        MiBus
      </div>

      {role && role !== "PASAJERO" && (
        <div className="navbar-actions">
          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
