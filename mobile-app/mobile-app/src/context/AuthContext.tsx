import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Role = "ADMIN" | "INSPECTOR" | "CHOFER" | "PASAJERO" | "USUARIO" | null;

interface AuthContextType {
  userRole: Role;
  token: string | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; role?: Role; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}


const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: any) => {
  const [userRole, setUserRole] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      
      const storedRole = await AsyncStorage.getItem("userRole");
      const storedToken = await AsyncStorage.getItem("token");

      if (storedRole) setUserRole(storedRole as Role);
      if (storedToken) setToken(storedToken);

      console.log("TOKEN GUARDADO:", storedToken);
      setLoading(false);
    };

    loadSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
    const response = await fetch("https://mibus-backend-1.onrender.com/api/auth/signin", { //"http://192.168.100.9:4001/api/auth/signin"
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ username, password }),
});

console.log("STATUS:", response.status);

if (!response.ok) {
  const errorText = await response.text();
  console.log("ERROR BODY:", errorText);
  throw new Error("Login failed");
}

const data = await response.json();
console.log("DATA:", data);
console.log("TOKEN NUEVO:", data.token);

await AsyncStorage.setItem("token", data.token);


      if (!response.ok) {
        return { success: false, error: data.error };
      }

      await AsyncStorage.setItem("userRole", data.role);
      await AsyncStorage.setItem("token", data.token);

      setUserRole(data.role);
      setToken(data.token);

      return { success: true, role: data.role };

    } catch (err) {
  console.log("ERROR REAL LOGIN:", err);
  return { success: false, error: "Error de conexión" };
}

  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["userRole", "token"]);
    setUserRole(null);
    setToken(null);
  };

 if (loading) {
  return null; // o un <View />
}

return (
  <AuthContext.Provider value={{ userRole, token, login, logout, loading }}>
    {children}
  </AuthContext.Provider>
);

};

export const useAuth = () => useContext(AuthContext);
