import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const APPLICATIONS_KEY = "applications";

const dummyEvents = [
  { id: "1", title: "Concert Event", location: "Bangalore" },
  { id: "2", title: "Wedding Event", location: "Hyderabad" },
  { id: "3", title: "Corporate Event", location: "Mumbai" },
];

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadApplications = async () => {
        try {
          const stored = await AsyncStorage.getItem(APPLICATIONS_KEY);
          if (stored) {
            setApplications(JSON.parse(stored));
          } else {
            setApplications([]);
          }
        } catch (error) {
          console.log("Failed to load applications:", error);
          setApplications([]);
        }
      };

      loadApplications();
    }, []),
  );

  const appliedEvents = dummyEvents.filter((event) =>
    applications.includes(event.id),
  );

  if (appliedEvents.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>No applications yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={appliedEvents}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  listContent: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  location: {
    color: "#666",
  },
});
