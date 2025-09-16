import React from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { clearCompare, removeFromCompare } from "../../store/carSlice";
import { RootState } from "../../store/store";

export default function CompareScreen() {
  const dispatch = useDispatch();
  const compareList = useSelector((state: RootState) => state.cars.compareList);

  if (compareList.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No cars added for comparison.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal style={styles.scroll}>
      {compareList.map((car) => (
        <View key={car.id} style={styles.card}>
          <Text style={styles.title}>{car.make} {car.model}</Text>
          <Text>Year: {car.year}</Text>
          <Text>Fuel: {car.fuel}</Text>
          <Text>Mileage: {car.mileage}</Text>
          <Text style={styles.price}>₹{car.price.toLocaleString()}</Text>
          <Button title="Remove" onPress={() => dispatch(removeFromCompare(car.id))} />
        </View>
      ))}
      <Button title="Clear All" onPress={() => dispatch(clearCompare())} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexDirection: "row", padding: 10 },
  card: {
    width: 200,
    marginRight: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  title: { fontWeight: "bold", fontSize: 16 },
  price: { color: "green", marginTop: 5 },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
