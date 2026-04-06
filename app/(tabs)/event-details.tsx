import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

const APPLICATIONS_KEY = "applications";

const dummyEvents = [
  {
    id: "1",
    title: "Concert Event",
    location: "Bangalore",
    pay: "₹800/day",
    date: "12 Apr 2026",
    shift: "9 AM - 6 PM",
    description:
      "Help manage guest flow, entry coordination, and backstage support.",
  },
  {
    id: "2",
    title: "Wedding Event",
    location: "Hyderabad",
    pay: "₹700/day",
    date: "14 Apr 2026",
    shift: "10 AM - 8 PM",
    description:
      "Assist with guest seating, food coordination, and general event support.",
  },
  {
    id: "3",
    title: "Corporate Event",
    location: "Mumbai",
    pay: "₹900/day",
    date: "18 Apr 2026",
    shift: "8 AM - 5 PM",
    description:
      "Support registration desk, attendee guidance, and venue coordination.",
  },
];

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadApplications = async () => {
        try {
          const stored = await AsyncStorage.getItem(APPLICATIONS_KEY);

          if (stored) {
            setAppliedIds(JSON.parse(stored));
          } else {
            setAppliedIds([]);
          }
        } catch (error) {
          console.log("Failed to load applications:", error);
          setAppliedIds([]);
        }
      };

      loadApplications();
    }, []),
  );

  const event = dummyEvents.find((item) => item.id === id);

  const handleApply = async () => {
    if (!event) {
      return;
    }

    if (appliedIds.includes(event.id)) {
      Alert.alert("Already applied", "You have already applied to this event.");
      return;
    }

    try {
      const updated = [...appliedIds, event.id];
      setAppliedIds(updated);
      await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
      Alert.alert("Applied successfully");
    } catch (error) {
      console.log("Failed to save application:", error);
      Alert.alert("Error", "Could not save application.");
    }
  };

  const handleBackToEvents = () => {
    router.replace("/(tabs)/events");
  };

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

  const isApplied = appliedIds.includes(event.id);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.location}>{event.location}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Pay</Text>
        <Text style={styles.value}>{event.pay}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{event.date}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Shift</Text>
        <Text style={styles.value}>{event.shift}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>About this event</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      <Pressable
        style={[styles.button, isApplied && styles.appliedButton]}
        onPress={handleApply}
      >
        <Text style={styles.buttonText}>
          {isApplied ? "Applied" : "Apply Now"}
        </Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleBackToEvents}>
        <Text style={styles.secondaryButtonText}>Back to Events</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
