import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppScreen from "../src/components/AppScreen";
import PrimaryButton from "../src/components/PrimaryButton";
import { theme } from "../src/themes";

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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loaderText}>Checking login...</Text>
      </View>
    );
  }

  return (
    <AppScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.heroCard}>
              <Text style={styles.eyebrow}>Event Staffing</Text>
              <Text style={styles.title}>Find flexible gigs near you</Text>
              <Text style={styles.subtitle}>
                Log in to explore events, apply quickly, and track your
                applications.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Volunteer Login</Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="words"
                style={styles.input}
              />

              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Enter your city"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="words"
                style={styles.input}
              />

              <TextInput
                value={phone}
                onChangeText={(text) =>
                  setPhone(text.replace(/[^0-9]/g, "").slice(0, 10))
                }
                placeholder="Enter phone number"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.input}
              />

              <PrimaryButton label="Continue" onPress={handleContinue} />

              <Text style={styles.footerNote}>
                You’ll verify with OTP in the next step.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  loaderText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
    lineHeight: 34,
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
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "700",
    marginBottom: theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    fontSize: theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  footerNote: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    textAlign: "center",
  },
});
