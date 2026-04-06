import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getApplications } from "../../src/api/application";

const AUTH_STORAGE_KEY = "staffing_app_authenticated";

type ApplicationItem = {
  id: number;
  eventId: number;
  volunteerId: number;
  status: string;
  appliedAt: string;
  event: {
    id: number;
    title: string;
    location: string;
    city: string;
    eventDate: string;
    shiftStart: string;
    shiftEnd: string;
    payPerDay: number;
    description: string;
    status: string;
  };
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShift(start: string, end: string) {
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);

      const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;

      if (!parsedUser?.id) {
        setApplications([]);
        return;
      }

      const data = await getApplications(parsedUser.id);
      setApplications(data);
    } catch (error) {
      console.log("Failed to load applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadApplications();
    }, [loadApplications]),
  );

  if (loading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator size="large" />
        <Text style={styles.helperText}>Loading applications...</Text>
      </View>
    );
  }

  if (applications.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>No applications yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={applications}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.event.title}</Text>
          <Text style={styles.location}>
            {item.event.location}, {item.event.city}
          </Text>
          <Text style={styles.meta}>
            Date: {formatDate(item.event.eventDate)}
          </Text>
          <Text style={styles.meta}>
            Shift: {formatShift(item.event.shiftStart, item.event.shiftEnd)}
          </Text>
          <Text style={styles.meta}>Pay: ₹{item.event.payPerDay}/day</Text>
          <Text style={styles.status}>Status: {item.status}</Text>
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
  helperText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
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
    marginBottom: 8,
  },
  meta: {
    color: "#333",
    marginBottom: 4,
  },
  status: {
    marginTop: 8,
    fontWeight: "600",
    color: "#111",
  },
});
