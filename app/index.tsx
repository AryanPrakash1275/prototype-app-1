import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const AUTH_STORAGE_KEY = "staffing_app_authenticated";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (savedUser) {
          router.replace("/(tabs)");
          return;
        }
      } catch (error) {
        console.log("Failed to read auth state:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleContinue = () => {
    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();
    const trimmedCity = city.trim();

    if (trimmedName.length < 2) {
      Alert.alert("Invalid name", "Please enter your name.");
      return;
    }

    if (trimmedCity.length < 2) {
      Alert.alert("Invalid city", "Please enter your city.");
      return;
    }

    if (trimmedPhone.length !== 10) {
      Alert.alert(
        "Invalid phone number",
        "Please enter a valid 10-digit phone number.",
      );
      return;
    }

    router.push({
      pathname: "/otp",
      params: {
        phone: trimmedPhone,
        name: trimmedName,
        city: trimmedCity,
      },
    });
  };

  if (checkingAuth) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loaderText}>Checking login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteer Login</Text>
      <Text style={styles.subtitle}>Enter your details to continue</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        autoCapitalize="words"
        style={styles.input}
      />

      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="Enter your city"
        autoCapitalize="words"
        style={styles.input}
      />

      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        maxLength={10}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
