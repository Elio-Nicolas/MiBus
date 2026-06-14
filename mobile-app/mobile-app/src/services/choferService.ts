import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://mibus-backend-1.onrender.com/api/chofer";

const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

// ================== OBTENER CHOFER LOGEADO ============================ //
export const getChoferMe = async () => {
  const token = await getToken();
  console.log("TOKEN:", token);

  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("STATUS:", res.status);

  if (!res.ok) throw new Error("Error obteniendo chofer");

  return res.json();
};

// ========================== INICIA SESION DE CHOFER LOGEADO =============================== //
export const getActiveSession = async () => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/session/active`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;

  return res.json();
};

// ================================== ULTIMA SESION ====================================== //
export const getLastSessions = async () => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/session/last`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];

  return res.json();
};

// ================================= START/STOP SESION ======================================= //
export const startSession = async () => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/session/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Error iniciando recorrido");

  return res.json();
};

export const stopSession = async (sessionId: string) => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/session/stop`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!res.ok) throw new Error("Error finalizando recorrido");

  return res.json();
};

