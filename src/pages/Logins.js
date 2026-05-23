import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import busImage from "../assets/image.png";

const Login = () => {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("https://mibus-backend-1.onrender.com/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
      }),
    });

    const data = await res.json();
    console.log("Data recibida:", data);

    if (res.ok) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          token: data.token,
          userId: data.userId,
          username: data.username,
          role: data.role,
        })
      );

      alert(`Usuario encontrado: ${data.username}`);

      if (data.role === "ADMIN") navigate("/admin"); 
      else if (data.role === "INSPECTOR") navigate("/inspector");
      else if (data.role === "CHOFER") navigate("/chofer");
      else if (data.role === "PASAJERO") navigate("/mapa");
      else if (data.role === "USUARIO") navigate("/mapa");
    } else {
      alert("Error: " + data.error);
    }

  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    alert("Error en el servidor");
  }
};

  return (
    <div className="login-layout">
      
      {/* IZQUIERDA – FORM */}
      <div className="login-left">
        <h1 className="logo">MiBus</h1>

        <p className="subtitle">
          Iniciá sesión en tu cuenta
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <span>Recordar contraseña</span>
          </div>

          <button type="submit" className="btn-primary">
            CONTINUAR
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/signin")}
          >
            CREAR CUENTA
          </button>
        </form>
      </div>

      {/* DERECHA – HERO */}
      <div className="login-right">
        <img src={busImage} alt="MiBus" />
        <h2>Monitoreo inteligente de transporte</h2>
        <p>
          Visualizá colectivos en tiempo real, optimizá recorridos y mejorá la experiencia urbana.
        </p>
      </div>
    </div>
  );
};

export default Login;
