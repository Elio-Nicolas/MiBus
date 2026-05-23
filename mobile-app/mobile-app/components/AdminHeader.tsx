import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router"; // si usás expo-router
import { useRef } from "react";


type WeatherData = {
  temperature: number;
  weathercode: number;
};

type Props = {
  city: string;
  weatherCode: number;
};

export default function AdminHeader({ city, weatherCode }: Props) {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

const handlePressIn = () => {
  pressTimer.current = setTimeout(() => {
    router.push("/login");
  }, 5000);
};

const handlePressOut = () => {
  if (pressTimer.current) {
    clearTimeout(pressTimer.current);
  }
};
useEffect(() => {
  Animated.loop(
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);


  // Hora en vivo
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clima real - Villa Mercedes coords aproximadas
  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-33.675&longitude=-65.458&current_weather=true"
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather(data.current_weather);
      })
      .catch((err) => console.log(err));
  }, []);

  const theme = getWeatherTheme(weather?.weathercode);

  const handleWeatherPress = () => {
  Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 1.2,
      duration: 150,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }),
  ]).start(() => {
    router.push("/forecast"); // pantalla nueva
  });
};

const rotate = rotateAnim.interpolate({
  inputRange: [0, 1],
  outputRange: ["0deg", "360deg"],
});


  return (
    <View style={[styles.container, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
      <View>
        <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Text style={styles.brand}>MiBus</Text>
        <Text style={styles.subtitle}>Transporte Inteligente</Text>
        </TouchableOpacity>
        <Text style={styles.city}>Villa Mercedes</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{time.toLocaleTimeString()}</Text>
        <Text style={styles.date}>{time.toLocaleDateString()}</Text>

        {weather && (
  <TouchableOpacity onPress={() => router.push("/forecast")}>
  <Animated.View
    style={{
      transform: [
        { scale: scaleAnim },
        { rotate },
      ],
    }}
  >
    <Ionicons
      name={getWeatherIcon(weather.weathercode)}
      size={24}
      color={theme.accent}
    />
  </Animated.View>
</TouchableOpacity>
)} 
      </View>
    </View>
  );
}

function getWeatherIcon(code?: number) {
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 7;

  if (code === undefined) return "cloud-outline";

  // ☀️ Despejado
  if (code < 3) {
    return isNight ? "moon" : "sunny";
  }

  // ⛅ Parcial
  if (code < 45) {
    return isNight ? "cloudy-night" : "partly-sunny";
  }

  // 🌧️ Lluvia
  if (code < 65) return "rainy";

  // ❄️ Nieve
  if (code < 75) return "snow";

  // ⛈️ Tormenta
  if (code < 95) return "thunderstorm";

  return "cloud";
}


function getWeatherTheme(code?: number) {
  if (!code && code !== 0) {
    return { bg: "#0f172a", border: "#1e293b", accent: "#38bdf8" };
  }

  if (code < 3)
    return { bg: "#0c4a6e", border: "#38bdf8", accent: "#7dd3fc" };

  if (code < 45)
    return { bg: "#1e293b", border: "#64748b", accent: "#94a3b8" };

  if (code < 55)
    return { bg: "#020617", border: "#1e40af", accent: "#60a5fa" };

  if (code < 75)
    return { bg: "#082f49", border: "#38bdf8", accent: "#bae6fd" };

  if (code < 95)
    return { bg: "#020617", border: "#7c3aed", accent: "#c4b5fd" };

  return { bg: "#0f172a", border: "#1e293b", accent: "#38bdf8" };
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  city: {
    color: "#94a3b8",
    fontSize: 13,
  },
  right: {
    alignItems: "flex-end",
  },
  time: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  temp: {
    marginLeft: 5,
    fontSize: 14,
  },
});
