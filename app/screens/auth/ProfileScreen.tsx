import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function ProfileScreen() {
  const bookedDrives = useSelector(
    (state: RootState) => state.bookedTestDrives.drives
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Booked Test Drives</Text>
      {bookedDrives.length === 0 ? (
        <Text style={styles.noData}>No test drives booked yet.</Text>
      ) : (
        <FlatList
          data={bookedDrives}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                {/* Left side */}
                <View style={styles.left}>
                  <Text style={styles.dealerName}>{item.dealer.dealerName} Dealers</Text>
                  <Text style={styles.dealerLocation}>{item.dealer.location}</Text>
                  <Text style={styles.carName}>{item.car.make} {item.car.model}</Text>
                </View>

                {/* Right side */}
                <View style={styles.right}>
                  <Text style={styles.date}>{item.date}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  noData: { fontSize: 16, color: "#777" },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flex: 2 },
  right: { flex: 1, alignItems: "flex-end" },
  dealerName: { fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  dealerLocation: { fontSize: 14, color: "#555", marginBottom: 2 },
  carName: { fontSize: 14, color: "#333" },
  date: { fontWeight: "600", fontSize: 14 },
  time: { fontSize: 14, color: "#555" },
});
