import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getApplications } from "../../src/api/application";
import { getEvents } from "../../src/api/event";
import EventCard from "../../src/components/EventCard";
import { theme } from "../../src/themes";

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
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
      setRefreshing(false);
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.helperText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          events.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>Open Events</Text>
            <Text style={styles.subheading}>
              Browse available gigs and apply in a few taps.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No open events right now</Text>
            <Text style={styles.emptySubtitle}>
              Pull to refresh and check again later.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const applied = appliedIds.includes(item.id);

          return (
            <EventCard
              title={item.title}
              location={item.location}
              city={item.city}
              pay={item.payPerDay}
              date={formatDate(item.eventDate)}
              shift={formatShift(item.shiftStart, item.shiftEnd)}
              applied={applied}
              onPress={() =>
                router.push({
                  pathname: "/event-details",
                  params: { id: item.id.toString() },
                })
              }
            />
          );
        }}
      />
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
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  heading: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: "800",
    marginBottom: theme.spacing.xs,
  },
  subheading: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    textAlign: "center",
  },
});
