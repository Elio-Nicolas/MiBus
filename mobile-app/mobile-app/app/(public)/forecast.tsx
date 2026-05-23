import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";


type ForecastDay = {
  date: string;
  temp_max: number;
  temp_min: number;
};

export default function ForecastScreen() {
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-33.675&longitude=-65.458&daily=temperature_2m_max,temperature_2m_min&timezone=auto"
    )
      .then(res => res.json())
      .then(data => {
        const days = data.daily.time.map((date: string, index: number) => ({
          date,
          temp_max: data.daily.temperature_2m_max[index],
          temp_min: data.daily.temperature_2m_min[index],
        }));
        setForecast(days);
      })
      .catch(err => console.log(err));

    // Animación entrada pantalla
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={styles.title}>Pronóstico Extendido</Text>

        <ScrollView
         style={{ marginTop: 25 }}
         contentContainerStyle={{ paddingBottom: 60 }}
        >
          {forecast.map((day, index) => (
            <Animated.View
              key={index}
              style={[
                styles.card,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.row}>
                <Ionicons name="partly-sunny" size={26} color="#facc15" />
                <Text style={styles.date}>{formatDate(day.date)}</Text>
              </View>

              <Text style={styles.temp}>
                {day.temp_max}° / {day.temp_min}°
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
   </SafeAreaView>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    //backdropFilter: "blur(10px)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  date: {
    color: "#cbd5e1",
    fontSize: 15,
    textTransform: "capitalize",
  },
  temp: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
  },
});