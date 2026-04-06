import { StyleSheet, Text, View } from "react-native";
import { theme } from "../themes";

type StatusBadgeProps = {
  label: string;
  tone?: "success" | "warning" | "neutral";
};

export default function StatusBadge({
  label,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        tone === "success" && styles.success,
        tone === "warning" && styles.warning,
        tone === "neutral" && styles.neutral,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  success: {
    backgroundColor: "rgba(22, 163, 74, 0.18)",
  },
  warning: {
    backgroundColor: "rgba(245, 158, 11, 0.18)",
  },
  neutral: {
    backgroundColor: "rgba(156, 163, 175, 0.18)",
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.tiny,
    fontWeight: "700",
  },
});
