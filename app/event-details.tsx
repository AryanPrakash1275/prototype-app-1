import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { applyToEvent, getApplications } from "../src/api/application";
import { getEvents } from "../src/api/event";
import PrimaryButton from "../src/components/PrimaryButton";
import StatusBadge from "../src/components/StatusBadge";
import { theme } from "../src/themes";

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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.helperText}>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Event not found</Text>
        <Text style={styles.emptySubtitle}>
          This event may have been removed or is no longer available.
        </Text>

        <View style={styles.emptyButtonWrap}>
          <PrimaryButton label="Go to Events" onPress={handleBackToEvents} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.location}>
                {event.location}, {event.city}
              </Text>
            </View>

            {isApplied ? <StatusBadge label="Applied" tone="success" /> : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pay</Text>
            <Text style={styles.statValue}>₹{event.payPerDay}/day</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Openings</Text>
            <Text style={styles.statValue}>{event.requiredVolunteers}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionLabel}>Date</Text>
          <Text style={styles.sectionValue}>{formatDate(event.eventDate)}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionLabel}>Shift</Text>
          <Text style={styles.sectionValue}>
            {formatShift(event.shiftStart, event.shiftEnd)}
          </Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionLabel}>About this event</Text>
          <Text style={styles.description}>
            {event.description?.trim() || "No description available."}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={
            isSubmitting ? "Applying..." : isApplied ? "Applied" : "Apply Now"
          }
          onPress={handleApply}
          disabled={isApplied || isSubmitting}
          loading={isSubmitting}
        />

        <Text style={styles.backText} onPress={handleBackToEvents}>
          Back to Events
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  helperText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "800",
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyButtonWrap: {
    width: "100%",
    marginTop: theme.spacing.xl,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 140,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  heroTextWrap: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: theme.spacing.sm,
  },
  location: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "700",
  },
  detailCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionValue: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  description: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  backText: {
    marginTop: theme.spacing.md,
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: "600",
  },
});
