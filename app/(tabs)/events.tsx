import { FlatList, StyleSheet, Text, View } from "react-native";

const events = [
  { id: "1", title: "Tech Conference", location: "Bangalore", pay: 800 },
  { id: "2", title: "Music Fest", location: "Mumbai", pay: 1000 },
  { id: "3", title: "Startup Meetup", location: "Delhi", pay: 600 },
];

export default function Events() {
  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.location}</Text>
            <Text>₹{item.pay} / day</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
