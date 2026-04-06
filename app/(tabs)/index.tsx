import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

const AUTH_STORAGE_KEY = "staffing_app_authenticated";
const APPLICATIONS_KEY = "applications";

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, APPLICATIONS_KEY]);

      router.dismissAll();
      router.replace("/");
    } catch (error) {
      console.log("Failed to clear auth state:", error);
      Alert.alert("Error", "Could not log out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>You are logged in as a volunteer.</Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
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
