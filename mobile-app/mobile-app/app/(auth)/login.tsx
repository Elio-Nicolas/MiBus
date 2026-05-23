import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";


export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  const result = await login(username, password);

  if (!result.success) return;

  if (result.role === "CHOFER") {
    router.replace("/(protected)/driver");
  } else if (result.role === "INSPECTOR") {
    router.replace("/(protected)/inspector");
  }else {
    router.replace("/");
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>MiBus</Text>
        <Text style={styles.subtitle}>Iniciá sesión en tu cuenta</Text>

        <TextInput
          placeholder="Usuario"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Contraseña"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>CONTINUAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/signin")}
        >
          <Text style={styles.secondaryText}>CREAR CUENTA</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 16,
    elevation: 5,
  },
  logo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f766e",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  primaryBtn: {
    backgroundColor: "#0f766e",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  primaryText: {
    color: "white",
    fontWeight: "600",
  },
  secondaryBtn: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryText: {
    fontWeight: "600",
  },
});
