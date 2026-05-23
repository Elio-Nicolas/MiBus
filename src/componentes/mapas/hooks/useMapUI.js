export const useMapUI = (role) => {
  const ROLE_UI = {
    GUEST: {
      lineas: true,
      clima: true,
      engranaje: false,
      cerrarSesion: false,
      chofer: false,
      inspector: false,
    },
    PASAJERO: {
      lineas: true,
      clima: true,
      engranaje: false,
      cerrarSesion: false,
      chofer: false,
      inspector: false,
    },
    INSPECTOR: {
      lineas: true,
      clima: true,
      engranaje: false,
      cerrarSesion: true,
      chofer: false,
      inspector: false,
    },
    CHOFER: {
      lineas: false,
      clima: false,
      engranaje: false,
      cerrarSesion: true,
      chofer: false,
      inspector: false,
    },
    ADMIN: {
      lineas: true,
      clima: true,
      engranaje: true,
      cerrarSesion: true,
      chofer: true,
      inspector: true,
    },
  };

  return ROLE_UI[role] || ROLE_UI.GUEST;
};