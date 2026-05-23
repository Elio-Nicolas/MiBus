import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from "react-native";

import {
  getInspectorMe,
  getActiveInspectorSession,
  startInspectorSession,
  stopInspectorSession
} from "@/src/services/inspectorService";

import MapView, { Marker } from "react-native-maps";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";

import { socket } from "@/src/socket";
import { getInspectorDrivers } from "@/src/services/inspectorService";

export default function InspectorScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [driverLocations, setDriverLocations] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [inspector, setInspector] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);

  // ========================= CARGA INICIAL =========================
  const loadDrivers = async () => {
    try {
      const data = await getInspectorDrivers();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error cargando choferes:", err);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  // ========================= SOCKET =========================
  useEffect(() => {
    socket.on("locationUpdate", (data: any) => {
      setDriverLocations((prev: any) => ({
        ...prev,
        [data.unidad]: {
          latitude: data.lat,
          longitude: data.lon,
        },
      }));
    });

    return () => {
      socket.off("locationUpdate");
    };
  }, []);
  
  // ========================= CATRGA DATOS =========================
  useEffect(() => {
  const loadInspectorData = async () => {
    try {
      const me = await getInspectorMe();
      const session = await getActiveInspectorSession();

      setInspector(me);
      setActiveSession(session);
    } catch (err) {
      console.log("Error cargando inspector:", err);
    }
  };

  loadInspectorData();
}, []);

  // ========================= LÍNEAS =========================
  const lines = useMemo(() => {
    return [...new Set(drivers.map(d => d.assignedLine).filter(Boolean))];
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    if (!selectedLine) return drivers;
    return drivers.filter(d => d.assignedLine === selectedLine);
  }, [drivers, selectedLine]);

  // ========================= REFRESH =========================
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrivers();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(public)");
  };

  const handleCollapse = () => {
    setSelectedLine(null);
    setSelectedDriver(null);
  };

   // ================================ UBICACION INICIAL =============================== //
   const currentLocation = useMemo(() => {
  if (selectedDriver) {
    const liveLocation =
      driverLocations[selectedDriver.assignedUnit];

    if (liveLocation) return liveLocation;

    if (selectedDriver.location) {
      return {
        latitude: selectedDriver.location.latitude || selectedDriver.location.lat,
        longitude: selectedDriver.location.longitude || selectedDriver.location.lon,
      };
    }
  }

  for (const driver of filteredDrivers) {
    const live = driverLocations[driver.assignedUnit];
    if (live) return live;

    if (driver.location) {
      return {
        latitude: driver.location.latitude || driver.location.lat,
        longitude: driver.location.longitude || driver.location.lon,
      };
    }
  }

  return null;
}, [selectedDriver, driverLocations, filteredDrivers]);

// ============================== INICIO DE SESION ======================================
const handleStartSession = async () => {
  try {
    const session = await startInspectorSession();
    setActiveSession(session);
  } catch (err) {
    console.log("Error iniciando sesión:", err);
  }
};

const handleStopSession = async () => {
  try {
    const session = await stopInspectorSession();
    setActiveSession(null);
  } catch (err) {
    console.log("Error cerrando sesión:", err);
  }
};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
  <View>
    <Text style={styles.title}>Panel Inspector</Text>

    <Text style={styles.userInfo}>
      Usuario: {inspector?.username || "Cargando..."}
    </Text>

    <Text style={styles.userInfo}>
      Estado: {activeSession ? "🟢 Sesión Activa" : "🔴 Sin sesión"}
    </Text>
  </View>

  <View style={{ gap: 8 }}>
    {!activeSession ? (
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartSession}
      >
        <Text style={styles.sessionText}>Iniciar</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={styles.stopButton}
        onPress={handleStopSession}
      >
        <Text style={styles.sessionText}>Finalizar</Text>
      </TouchableOpacity>
    )}

    <TouchableOpacity
      style={styles.logoutButtonTop}
      onPress={handleLogout}
    >
      <Text style={styles.logoutText}>Salir</Text>
    </TouchableOpacity>
  </View>
</View>


      {/* ================= PANEL INFO ================= */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          Total Choferes: {drivers.length}
        </Text>
        <Text style={styles.summaryText}>
          Líneas activas: {lines.length}
        </Text>
      </View>

      {/* ================= BOTÓN COLAPSAR ================= */}
      <TouchableOpacity style={styles.collapseButton} onPress={handleCollapse}>
        <Text style={styles.collapseText}>Mostrar todos los choferes</Text>
      </TouchableOpacity>

      {/* ================= SELECTOR DE LÍNEA ================= */}
      <Text style={styles.sectionTitle}>Filtrar por Línea</Text>
      <View style={styles.lineContainer}>
        {lines.map(line => (
          <TouchableOpacity
            key={line}
            style={[
              styles.lineButton,
              selectedLine === line && styles.lineButtonActive
            ]}
            onPress={() => {
              setSelectedLine(line);
              setSelectedDriver(null);
            }}
          >
            <Text
              style={[
                styles.lineText,
                selectedLine === line && { color: "#fff" }
              ]}
            >
              {line}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ================= LISTA DE CHOFERES ================= */}
      <Text style={styles.sectionTitle}>Choferes</Text>

      {filteredDrivers.map(driver => (
        <TouchableOpacity
          key={driver._id}
          style={[
            styles.driverCard,
            selectedDriver?._id === driver._id && styles.selectedCard
          ]}
          onPress={() => setSelectedDriver(driver)}
        >
          <Text style={styles.driverName}>{driver.username}</Text>

          <Text style={styles.driverInfo}>
            Línea: {driver.assignedLine || "-"}
          </Text>

          <Text style={styles.driverInfo}>
            Unidad: {driver.assignedUnit || "-"}
          </Text>

          <Text style={styles.driverInfo}>
            Ubicación: {driverLocations[driver.assignedUnit]
              ? "🟢 Activa"
              : "⚪ Sin datos"}
          </Text>
        </TouchableOpacity>
      ))}

      {/* ================= MAPA ================= */}
   <View style={{ height: 400, marginTop: 20 }}>
  {currentLocation && (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      region={{
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {filteredDrivers.map(driver => {
        const location =
          driverLocations[driver.assignedUnit] || driver.location;

        if (!location) return null;

        return (
          <Marker
            key={driver._id}
            coordinate={{
              latitude: location.latitude || location.lat,
              longitude: location.longitude || location.lon,
            }}
            title={driver.username}
            description={`Línea ${driver.assignedLine} - Unidad ${driver.assignedUnit}`}
          />
        );
      })}
    </MapView>
  )}
</View>


      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  summaryText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  lineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  lineButton: {
    backgroundColor: "#334155",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  lineButtonActive: {
    backgroundColor: "#0ea5e9",
  },
  lineText: {
    color: "#cbd5e1",
    fontWeight: "bold",
  },
  collapseButton: {
    backgroundColor: "#0ea5e9",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  collapseText: {
    color: "#fff",
    fontWeight: "bold",
  },
  driverCard: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#0ea5e9",
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  driverInfo: {
    fontSize: 13,
    color: "#94a3b8",
  },
  logoutButton: {
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  },

  header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
},

userInfo: {
  color: "#94a3b8",
  fontSize: 13,
},

startButton: {
  backgroundColor: "#16a34a",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 8,
  alignItems: "center",
},

stopButton: {
  backgroundColor: "#dc2626",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 8,
  alignItems: "center",
},

sessionText: {
  color: "#fff",
  fontWeight: "bold",
},

logoutButtonTop: {
  backgroundColor: "#334155",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 8,
  alignItems: "center",
},
});
