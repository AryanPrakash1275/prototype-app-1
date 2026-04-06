import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getApplications } from "../../src/api/application";
import { getEvents } from "../../src/api/event";

const AUTH_STORAGE_KEY = "staffing_app_authenticated";

type EventItem = {
  id: number;
  title: string;
  location: string;
  city: string;
  eventDate: string;
  shiftStart: string;
  shiftEnd: string;
  payPerDay: number;
  description: string;
  requiredVolunteers: number;
  status: string;
  createdAt: string;
};

type VolunteerApplication = {
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

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;

      const eventsData = await getEvents();
      setEvents(eventsData);

      if (parsedUser?.id) {
        const applicationsData: VolunteerApplication[] = await getApplications(
          parsedUser.id,
        );

        setAppliedIds(applicationsData.map((item) => item.eventId));
      } else {
        setAppliedIds([]);
      }
    } catch (error) {
      console.log("Failed to load events:", error);
      setEvents([]);
      setAppliedIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.helperText}>Loading events...</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>No open events right now</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const applied = appliedIds.includes(item.id);

        return (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/event-details",
                params: { id: item.id.toString() },
              })
            }
          >
            <View style={styles.topRow}>
              <Text style={styles.title}>{item.title}</Text>
              {applied ? (
                <View style={styles.appliedBadge}>
                  <Text style={styles.appliedBadgeText}>Applied</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.location}>
              {item.location}, {item.city}
            </Text>
            <Text style={styles.meta}>Pay: ₹{item.payPerDay}/day</Text>
            <Text style={styles.meta}>Date: {formatDate(item.eventDate)}</Text>
            <Text style={styles.meta}>
              Shift: {formatShift(item.shiftStart, item.shiftEnd)}
            </Text>

            <Text style={styles.linkText}>View details</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
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
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  location: {
    color: "#666",
    marginBottom: 8,
  },
  meta: {
    color: "#333",
    marginBottom: 4,
  },
  linkText: {
    marginTop: 10,
    color: "#111",
    fontWeight: "600",
  },
  appliedBadge: {
    backgroundColor: "#e6f4ea",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  appliedBadgeText: {
    color: "#1e7a34",
    fontSize: 12,
    fontWeight: "600",
  },
});
