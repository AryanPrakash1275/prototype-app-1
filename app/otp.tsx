import { loginVolunteer } from "@/src/api/volunteer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppScreen from "../src/components/AppScreen";
import PrimaryButton from "../src/components/PrimaryButton";
import { theme } from "../src/themes";

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
    <AppScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>Step 2 of 2</Text>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to {phone ?? "your phone"}.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>OTP</Text>

            <TextInput
              value={otp}
              onChangeText={(text) =>
                setOtp(text.replace(/[^0-9]/g, "").slice(0, 4))
              }
              placeholder="Enter OTP"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              style={styles.input}
              textAlign="center"
            />

            <PrimaryButton
              label={isSubmitting ? "Verifying..." : "Verify"}
              onPress={handleVerify}
              disabled={isSubmitting}
              loading={isSubmitting}
            />

            <Text style={styles.secondaryText} onPress={() => router.back()}>
              Change details
            </Text>

            <Text style={styles.note}>
              OTP is mocked right now for MVP flow.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.lg,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: "800",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.small,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 16,
    fontSize: 24,
    letterSpacing: 10,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  secondaryText: {
    marginTop: theme.spacing.md,
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "600",
  },
  note: {
    marginTop: theme.spacing.lg,
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
  },
});
