import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
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
import StatusBadge from "../../src/components/StatusBadge";
import { theme } from "../../src/themes";

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

function getStatusTone(status: string): "success" | "warning" | "neutral" {
  const normalized = status.toLowerCase();

  if (normalized === "approved") {
    return "success";
  }

  if (normalized === "pending") {
    return "warning";
  }

  return "neutral";
}

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadApplications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
      setRefreshing(false);
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.helperText}>Loading applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          applications.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadApplications(true)}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>My Applications</Text>
            <Text style={styles.subheading}>
              Track the status of the events you’ve applied for.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptySubtitle}>
              Apply to an event and it will show up here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.title}>{item.event.title}</Text>
              <StatusBadge
                label={item.status}
                tone={getStatusTone(item.status)}
              />
            </View>

            <Text style={styles.location}>
              {item.event.location}, {item.event.city}
            </Text>

            <View style={styles.metaGrid}>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>
                  {formatDate(item.event.eventDate)}
                </Text>
              </View>

              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Pay</Text>
                <Text style={styles.metaValue}>
                  ₹{item.event.payPerDay}/day
                </Text>
              </View>
            </View>

            <View style={styles.shiftBox}>
              <Text style={styles.metaLabel}>Shift</Text>
              <Text style={styles.metaValue}>
                {formatShift(item.event.shiftStart, item.event.shiftEnd)}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  empty: {
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
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "700",
  },
  location: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    marginBottom: theme.spacing.md,
  },
  metaGrid: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  metaBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  shiftBox: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  metaLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    marginBottom: 4,
  },
  metaValue: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
});
