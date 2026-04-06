import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../themes";
import StatusBadge from "./StatusBadge";

type EventCardProps = {
  title: string;
  city: string;
  location: string;
  pay: number;
  date: string;
  shift: string;
  applied?: boolean;
  onPress?: () => void;
};

export default function EventCard({
  title,
  city,
  location,
  pay,
  date,
  shift,
  applied = false,
  onPress,
}: EventCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {applied ? <StatusBadge label="Applied" tone="success" /> : null}
      </View>

      <Text style={styles.meta}>
        {location}, {city}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Text style={styles.infoLabel}>Pay</Text>
          <Text style={styles.infoValue}>₹{pay}</Text>
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{date}</Text>
        </View>
      </View>

      <View style={styles.infoPillFull}>
        <Text style={styles.infoLabel}>Shift</Text>
        <Text style={styles.infoValue}>{shift}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  pressed: {
    opacity: 0.92,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    marginTop: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  infoPill: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  infoPillFull: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  infoLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    marginBottom: 4,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
});
