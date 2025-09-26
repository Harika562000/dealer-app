import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { clearCompare, removeFromCompare } from "../../store/carSlice";
import { RootState } from "../../store/store";

export default function CompareScreen() {
  const dispatch = useDispatch();
  const compareList = useSelector((state: RootState) => state.cars.compareList);

  if (compareList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cars added for comparison.</Text>
      </View>
    );
  }

  const handleRemove = (id: string) => {
    dispatch(removeFromCompare(id));
    Alert.alert("Compare", "Car removed from comparison.");
  };

  const handleClearAll = () => {
    dispatch(clearCompare());
    Alert.alert("Compare", "All cars removed from comparison.");
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal contentContainerStyle={styles.scrollContainer} showsHorizontalScrollIndicator={false}>
        {compareList.map((car) => (
          <View key={car.id} style={styles.card}>
            <Image source={{ uri: car.image }} style={styles.image} />
            <Text style={styles.title}>{car.make} {car.model}</Text>
            <Text style={styles.price}>₹{car.price.toLocaleString()}</Text>
            <Text style={styles.originalPrice}>Original: ₹{car.originalPrice?.toLocaleString()}</Text>
            <Text>Year: {car.year}</Text>
            <Text>Fuel: {car.fuel}</Text>
            <Text>Mileage: {car.mileage}</Text>
            {car.transmission && <Text>Transmission: {car.transmission}</Text>}
            {car.seating && <Text>Seating: {car.seating}</Text>}
            {car.category && <Text>Category: {car.category}</Text>}

            {car.features && car.features.length > 0 && (
              <View style={styles.features}>
                <Text style={styles.featuresTitle}>Features:</Text>
                {car.features.map((feature, idx) => (
                  <Text key={idx} style={styles.featureItem}>• {feature}</Text>
                ))}
              </View>
            )}

            <Text style={styles.badges}>
              {car.seasonalOffer && "Seasonal Offer | "}
              {car.dealerPromotion && "Dealer Promotion | "}
              {car.isHotDeal && "Hot Deal | "}
              {car.isNewArrival && "New Arrival"}
            </Text>

            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(car.id)}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
        <Text style={styles.clearButtonText}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 15, backgroundColor: "#fff" },
  scrollContainer: { paddingHorizontal: 10 },
  card: {
    width: 250,
    marginRight: 15,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  image: { width: "100%", height: 150, borderRadius: 10, marginBottom: 10 },
  title: { fontWeight: "bold", fontSize: 18, marginBottom: 5 },
  price: { color: "green", fontSize: 16, marginBottom: 2 },
  originalPrice: { color: "#888", textDecorationLine: "line-through", marginBottom: 5 },
  features: { marginTop: 5 },
  featuresTitle: { fontWeight: "bold", fontSize: 14 },
  featureItem: { fontSize: 13, marginLeft: 8 },
  badges: { marginTop: 5, color: "red", fontWeight: "600" },
  removeButton: {
    marginTop: 10,
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  removeButtonText: { color: "#fff", fontWeight: "bold" },
  clearButton: {
    marginTop: 15,
    marginHorizontal: 20,
    backgroundColor: "#171C8F",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888" },
});
