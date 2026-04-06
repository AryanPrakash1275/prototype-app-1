import { loginVolunteer } from "@/src/api/volunteer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const AUTH_STORAGE_KEY = "staffing_app_authenticated";

export default function OtpScreen() {
  const router = useRouter();
  const { phone, name, city } = useLocalSearchParams<{
    phone?: string;
    name?: string;
    city?: string;
  }>();
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async () => {
    const trimmedOtp = otp.trim();

    if (trimmedOtp.length !== 4) {
      Alert.alert("Invalid OTP", "Please enter the 4-digit OTP.");
      return;
    }

    if (!phone || !name || !city) {
      Alert.alert(
        "Error",
        "Missing login details. Please go back and try again.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const volunteer = await loginVolunteer(phone, name, city);

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(volunteer));

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Could not log in. Please try again.");
      console.log("Failed to log in:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 4-digit OTP sent to {phone ?? "your phone"}
      </Text>

      <TextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        maxLength={4}
        style={styles.input}
      />

      <Pressable
        style={styles.button}
        onPress={handleVerify}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Verifying..." : "Verify"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.back()}
        disabled={isSubmitting}
      >
        <Text style={styles.secondaryButtonText}>Change details</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "500",
  },
});
