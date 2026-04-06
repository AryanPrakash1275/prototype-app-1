import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const APPLICATIONS_KEY = "applications";

const dummyEvents = [
  {
    id: "1",
    title: "Concert Event",
    location: "Bangalore",
    pay: "₹800/day",
    date: "12 Apr 2026",
    shift: "9 AM - 6 PM",
  },
  {
    id: "2",
    title: "Wedding Event",
    location: "Hyderabad",
    pay: "₹700/day",
    date: "14 Apr 2026",
    shift: "10 AM - 8 PM",
  },
  {
    id: "3",
    title: "Corporate Event",
    location: "Mumbai",
    pay: "₹900/day",
    date: "18 Apr 2026",
    shift: "8 AM - 5 PM",
  },
];

export default function EventsScreen() {
  const router = useRouter();
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

  return (
    <FlatList
      data={dummyEvents}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const applied = appliedIds.includes(item.id);

        return (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/event-details",
                params: { id: item.id },
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

            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.meta}>Pay: {item.pay}</Text>
            <Text style={styles.meta}>Date: {item.date}</Text>
            <Text style={styles.meta}>Shift: {item.shift}</Text>

            <Text style={styles.linkText}>View details</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
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
