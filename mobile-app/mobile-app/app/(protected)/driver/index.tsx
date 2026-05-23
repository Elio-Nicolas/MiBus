import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";

import {
  getChoferMe,
  getActiveSession,
  getLastSessions,
  startSession,
  stopSession,
} from "@/src/services/choferService";

import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { socket } from "@/src/socket";
import MapView, { Marker } from "react-native-maps";

export default function DriverScreen() {
  const { logout } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [chofer, setChofer] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const { userRole } = useAuth();

const loadSessions = async () => {
  try {
    const choferData = await getChoferMe();
    const active = await getActiveSession();
    const last = await getLastSessions();

    setChofer(choferData);
    setActiveSession(active);

    // ================= EVENTOS =================
    if (Array.isArray(last)) {
      const formatted = last.flatMap((s: any) => {
        const arr = [];
        if (s.startTime) arr.push({ type: "INICIO", time: s.startTime });
        if (s.endTime) arr.push({ type: "CIERRE", time: s.endTime });
        return arr;
      });

      setEvents(
        formatted
          .sort(
            (a, b) =>
              new Date(b.time).getTime() -
              new Date(a.time).getTime()
          )
          .slice(0, 5)
      );
    }

    // ================= ESTADO SHARING =================
    if (active && !active.endTime) {
      setSharing(true);
    } else {
      setSharing(false);
    }

    // ================= UBICACIÓN INICIAL =================
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        console.log("Permiso de ubicación denegado");
      }
    } catch (locationError) {
      console.log("Error obteniendo ubicación inicial:", locationError);
    }

  } catch (err) {
    console.log("Error cargando panel:", err);
  }
};

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let interval: any = null;

    if (activeSession && !activeSession?.endTime) {
      interval = setInterval(() => {
        const start = new Date(activeSession.startTime).getTime();
        setElapsedTime(Date.now() - start);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const startTracking = async () => {
    if (!chofer) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 5,
      },
      (location) => {
        const { latitude, longitude } = location.coords;

        setCurrentLocation({ latitude, longitude });

        socket.emit("locationUpdate", {
          lat: latitude,
          lon: longitude,
          timestamp: new Date(),
          unidad: chofer.assignedUnit,
          linea: chofer.assignedLine,
        });
      }
    );
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const unitStatus =
    activeSession && !activeSession?.endTime
      ? "EN SERVICIO"
      : "SIN SERVICIO";

  if (userRole !== "CHOFER") {
  return null;
 }    

  if (!chofer) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Cargando chofer...</Text>
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
      }
    >
      <Text style={styles.title}>Panel Chofer</Text>

      {/* CARD INFO */}
      <View style={styles.card}>
        <Text style={styles.label}>Usuario</Text>
        <Text style={styles.value}>{chofer.username}</Text>

        <View style={styles.rowInfo}>
          <View>
            <Text style={styles.label}>Unidad</Text>
            <Text style={styles.value}>{chofer.assignedUnit}</Text>
          </View>
          <View>
            <Text style={styles.label}>Línea</Text>
            <Text style={styles.value}>{chofer.assignedLine}</Text>
          </View>
        </View>

        <Text style={styles.label}>Estado</Text>
        <Text
          style={[
            styles.status,
            {
              color:
                unitStatus === "EN SERVICIO"
                  ? "#22c55e"
                  : "#ef4444",
            },
          ]}
        >
          {unitStatus}
        </Text>

        <Text style={styles.label}>Tiempo en recorrido</Text>
        <Text style={styles.timer}>{formatElapsed(elapsedTime)}</Text>
      </View>

      {/* BOTONES */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          disabled={!activeSession || activeSession?.endTime}
          onPress={() => {
            if (!sharing) {
              startTracking();
              socket.emit("startSharing");
              setSharing(true);
            } else {
              stopTracking();
              socket.emit("stopSharing");
              setSharing(false);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {sharing ? "Detener ubicación" : "Compartir ubicación"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.successButton}
          disabled={activeSession && !activeSession?.endTime}
          onPress={async () => {
            await startSession();
            await loadSessions();
          }}
        >
          <Text style={styles.buttonText}>Iniciar recorrido</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dangerButton}
          disabled={!activeSession || activeSession?.endTime}
          onPress={async () => {
            if (!activeSession?._id) return;
            await stopSession(activeSession._id);
            await loadSessions();
          }}
        >
          <Text style={styles.buttonText}>Finalizar recorrido</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* EVENTOS */}
      <Text style={styles.sectionTitle}>Últimos eventos</Text>

      <View style={styles.eventsCard}>
        {events.map((item, index) => (
          <View key={index} style={styles.eventRow}>
            <Text style={styles.eventType}>{item.type}</Text>
            <Text style={styles.eventTime}>
              {new Date(item.time).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </View>

      {/* MAPA */}
      <View style={styles.mapContainer}>
  {currentLocation ? (
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
      <Marker coordinate={currentLocation} />
    </MapView>
  ) : (
    <View style={styles.mapPlaceholder}>
      <Text style={{ color: "#94a3b8" }}>
        Ubicación no disponible
      </Text>
    </View>
  )}
</View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  label: {
    color: "#94a3b8",
    fontSize: 12,
  },
  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  rowInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  status: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 25,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  successButton: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  dangerButton: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#334155",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  eventsCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#334155",
  },
  eventType: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
  eventTime: {
    color: "#cbd5e1",
  },
  mapContainer: {
    height: 400,
    borderRadius: 20,
    overflow: "hidden",
  },

  mapPlaceholder: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#1e293b",
},

});
