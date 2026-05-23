import { useMemo } from "react";

const ROLE_UI = {
  GUEST: { lineas: true, clima: true, engranaje: false, cerrarSesion: false },
  PASAJERO: { lineas: true, clima: true, engranaje: false, cerrarSesion: false },
  INSPECTOR: { lineas: true, clima: true, engranaje: false, cerrarSesion: true },
  CHOFER: { lineas: false, clima: false, engranaje: false, cerrarSesion: true },
  ADMIN: { lineas: true, clima: true, engranaje: true, cerrarSesion: true },
};

export const useAuthUser = () => {
  return useMemo(() => {
    const storedUser = localStorage.getItem("user");

    let user = null;
    let role = "GUEST";

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.role) {
          user = parsed;
          role = parsed.role;
        }
      } catch {}
    }

    return {
      user,
      role,
      ui: ROLE_UI[role] || ROLE_UI.GUEST,
    };
  }, []);
};