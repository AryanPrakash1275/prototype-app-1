import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../../src/components/PrimaryButton";
import { theme } from "../../src/themes";

const AUTH_STORAGE_KEY = "staffing_app_authenticated";

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      router.replace("/login");
    } catch (error) {
      console.log("Failed to clear auth state:", error);
      Alert.alert("Error", "Could not log out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Dashboard</Text>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          You are logged in as a volunteer. Browse events, apply quickly, and
          track your application status.
        </Text>

        <View style={styles.actionWrap}>
          <PrimaryButton
            label={isLoggingOut ? "Logging out..." : "Logout"}
            onPress={handleLogout}
            disabled={isLoggingOut}
            loading={isLoggingOut}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    justifyContent: "center",
  },
  card: {
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
  actionWrap: {
    marginTop: theme.spacing.xl,
  },
});
