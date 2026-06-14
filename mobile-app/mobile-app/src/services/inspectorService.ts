import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://mibus-backend-1.onrender.com/api/inspector";

const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

/* =========================
   DATOS INSPECTOR
========================= */
export const getInspectorMe = async () => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Error obteniendo inspector");

  return res.json();
};

/* =========================
   CHOFERES
========================= */
export const getInspectorDrivers = async () => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/drivers`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Error obteniendo choferes");

  return res.json();
};

/* =========================
   SESIÓN
========================= */
export const getActiveInspectorSession = async () => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/session/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};

export const startInspectorSession = async () => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/session/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};

export const stopInspectorSession = async () => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/session/stop`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};
