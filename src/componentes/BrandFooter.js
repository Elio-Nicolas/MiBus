import React from "react";

const BrandFooter = () => {
  return (
    <div style={styles.footer} className="max-w-7xl mx-auto px-4 text-sm text-gray-500 text-center">
      IO Red <span style={styles.soft}>SOFTWARE</span> 
     © {new Date().getFullYear()} . Todos los derechos reservados.
    </div>
  );
};

const styles = {
  footer: {
    position: "fixed",
    bottom: 8,
    left: 12,
    fontSize: "12px",
    fontWeight: 600,
    color: "#9e9e9e",
    opacity: 0.85,
    zIndex: 9999,
    userSelect: "none",
    pointerEvents: "none", // no interfiere con clicks
  },
  soft: {
    fontWeight: 400,
    marginLeft: 4,
  },
};

export default BrandFooter;
