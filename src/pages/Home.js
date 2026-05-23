import Navbar from "../componentes/UI/Navbar";
import MapContainerComponent from "../componentes/mapas/MapContainerComponent";
import "../App.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* NAVBAR: líneas, clima, opciones */}
      <Navbar />

      {/* MAPA PRINCIPAL – PASAJERO */}
      <main className="map-section">
        <MapContainerComponent />
      </main>
    </div>
  );
};

export default Home;
