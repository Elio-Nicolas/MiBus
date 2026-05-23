import { Link } from "react-router-dom";
import "./Portada.css"; // Estilos separados para más claridad
import busImage from "../assets/image.png"; // 

const Portada = () => {
  return (
    <div className="portada-container">
      <h1 className="portada-titulo">MiBus</h1>
      <img src={busImage} alt="Bus" className="portada-imagen" />
      <div className="portada-botones">
        <Link to="/login">
          <button className="btn btn-acceder">ACCEDER</button>
        </Link>
        <Link to="/signup">
          <button className="btn btn-login">INICIAR SESIÓN</button>
        </Link>
      </div>
    </div>
  );
};

export default Portada;
