import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignIn.css";
import googleIcon from "../assets/Google.png";
import facebookIcon from "../assets/Facebook.png";
import imageIcon from "../assets/image.png";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [image, setImage] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ⚠️ USAMOS FormData (porque hay imagen)
    const formPayload = new FormData();
    formPayload.append("username", formData.username);
    formPayload.append("password", formData.password);
    if (image) {
      formPayload.append("image", image);
    }

    try {
    const res = await fetch("https://mibus-backend-1.onrender.com/api/users/signup", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: formData.username,
    password: formData.password,
  }),
});

      const data = await res.json();

      if (res.ok) {
        alert("Usuario registrado correctamente");
        navigate("/login");
      } else {
        alert(data.error || "Error al registrar usuario");
      }
    } catch (err) {
      console.error("Error al registrarse:", err);
      alert("Error en el servidor");
    }
  };

  return (
    <div className="signup-container">
      <h1 className="signup-title">MiBus</h1>

      <img src={imageIcon} alt="Bus" className="signup-image" />

      <form
        onSubmit={handleSubmit}
        className="signup-form"
        encType="multipart/form-data"
      >
        <div className="input-group">
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            className="signup-input"
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="signup-input"
            required
          />
        </div>

        <div className="input-group">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="signup-input"
          />
        </div>

        <button type="submit" className="signup-button">
          REGISTRARSE
        </button>

        <div className="divider">
          <hr />
          <span>o registrate con</span>
          <hr />
        </div>

        <div className="social-icons">
          <img src={googleIcon} alt="Google" />
          <img src={facebookIcon} alt="Facebook" />
        </div>

        <p style={{ marginTop: "1rem" }}>
          ¿Ya tenés cuenta?
          <Link to="/login">
            <button className="btn btn-login1"> INICIAR SESIÓN</button>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
