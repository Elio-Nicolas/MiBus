import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignIn.css";
import busImage from "../assets/image.png";

const SignIn = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch("https://mibus-backend-1.onrender.com/api/users/signin", { //se cambio de 3001 a 4001  o https://mibus-backend.onrender.com/api/users/signup
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

      if (res.ok) {
          localStorage.setItem(
          "user",
          JSON.stringify({
           token: data.token,
           userId: data.userId,
           username: data.username,
           role: data.role
          })
         );

        alert("USUARIO REGISTRADO ✔️");
        navigate("/mapa");
       }
        else {
          alert("Error: " + data.error);
       }
    } catch (err) {
      console.error("Error en el registro:", err);
      alert(" Error en el servidor");
    }
  };

  return (
    <div className="signin-container">
      <h2 className="titulo">Crear Cuenta</h2>

      <img src={busImage} alt="Bus" className="bus-image" />

      <form onSubmit={handleSubmit} className="signin-form">
        <div className="input-group">
          <label>Usuario</label>
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Confirmar Contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Repita Contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-signin">
          REGISTRARSE
        </button>
      </form>

      <p className="login-link">
        ¿Ya tenés cuenta? <Link to="/login">Iniciá Sesión</Link>
      </p>
    </div>
  );
};

export default SignIn;
