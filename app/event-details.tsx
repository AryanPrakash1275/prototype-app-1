import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { applyToEvent, getApplications } from "../src/api/application";
import { getEvents } from "../src/api/event";

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

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEventData = useCallback(async () => {
    if (!id) {
      setEvent(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;

      const events: EventItem[] = await getEvents();
      const selectedEvent =
        events.find((item) => item.id.toString() === id) ?? null;

      setEvent(selectedEvent);

      if (parsedUser?.id && selectedEvent) {
        const applications: ApplicationItem[] = await getApplications(
          parsedUser.id,
        );

        const alreadyApplied = applications.some(
          (item) => item.eventId === selectedEvent.id,
        );

        setIsApplied(alreadyApplied);
      } else {
        setIsApplied(false);
      }
    } catch (error) {
      console.log("Failed to load event details:", error);
      setEvent(null);
      setIsApplied(false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadEventData();
    }, [loadEventData]),
  );

  const handleApply = async () => {
    if (!event) {
      return;
    }

    if (isApplied) {
      Alert.alert("Already applied", "You have already applied to this event.");
      return;
    }

    try {
      setIsSubmitting(true);

      const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;

      if (!parsedUser?.id) {
        Alert.alert("Error", "Volunteer not found. Please log in again.");
        return;
      }

      await applyToEvent(event.id, parsedUser.id);

      setIsApplied(true);
      Alert.alert("Success", "Applied successfully.");
    } catch (error) {
      console.log("Failed to apply:", error);
      Alert.alert("Error", "Could not apply to this event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEvents = () => {
    router.replace("/(tabs)/events");
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.helperText}>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Event not found</Text>

        <Pressable style={styles.secondaryButton} onPress={handleBackToEvents}>
          <Text style={styles.secondaryButtonText}>Go to Events</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.location}>
        {event.location}, {event.city}
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Pay</Text>
        <Text style={styles.value}>₹{event.payPerDay}/day</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{formatDate(event.eventDate)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Shift</Text>
        <Text style={styles.value}>
          {formatShift(event.shiftStart, event.shiftEnd)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>About this event</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      <Pressable
        style={[
          styles.button,
          (isApplied || isSubmitting) && styles.appliedButton,
        ]}
        onPress={handleApply}
        disabled={isApplied || isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Applying..." : isApplied ? "Applied" : "Apply Now"}
        </Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleBackToEvents}>
        <Text style={styles.secondaryButtonText}>Back to Events</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  helperText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 17,
    color: "#111",
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  appliedButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "500",
  },
});
