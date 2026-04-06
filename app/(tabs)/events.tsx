import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

type EventItem = {
  id: string;
  title: string;
  location: string;
  pay: number;
};

const events: EventItem[] = [
  { id: "1", title: "Tech Conference", location: "Bangalore", pay: 800 },
  { id: "2", title: "Music Fest", location: "Mumbai", pay: 1000 },
  { id: "3", title: "Startup Meetup", location: "Delhi", pay: 600 },
];

export default function Events() {
  const handleApply = (id: string) => {
    console.log("Applied to event:", id);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.location}</Text>
            <Text style={styles.meta}>₹{item.pay} / day</Text>

            <Button
              mode="contained"
              onPress={() => handleApply(item.id)}
              style={styles.applyButton}
            >
              Apply
            </Button>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333333",
  },
  applyButton: {
    marginTop: 12,
  },
});
