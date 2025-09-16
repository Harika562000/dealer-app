import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { triggerNewArrivalNotification, triggerPriceDropNotification } from "../utils/notificationHelpers";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  mileage: string;
  image: string;
}

interface CarCardProps {
  car: Car;
  onPress: () => void;
}

export default function CarCard({ car, onPress }: CarCardProps) {
  const dispatch = useDispatch();

  const handlePriceDropAlert = () => {
    triggerPriceDropNotification(dispatch, car);
  };

  const handleNewArrivalAlert = () => {
    triggerNewArrivalNotification(dispatch, car);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: car.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{car.make} {car.model}</Text>
        <Text style={styles.details}>Year: {car.year} | {car.fuel}</Text>
        <Text style={styles.price}>₹{car.price.toLocaleString()}</Text>
        
        {/* Notification Action Buttons */}
        <View style={styles.notificationActions}>
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={handlePriceDropAlert}
          >
            <Ionicons name="trending-down" size={16} color="#e74c3c" />
            <Text style={styles.notificationButtonText}>Price Alert</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={handleNewArrivalAlert}
          >
            <Ionicons name="car" size={16} color="#27ae60" />
            <Text style={styles.notificationButtonText}>New Alert</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { margin: 10, borderRadius: 10, backgroundColor: "#fff", elevation: 3, display: "flex" },
  image: { width: "100%", height: 180, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  info: { padding: 10 },
  title: { fontSize: 16, fontWeight: "bold" },
  details: { fontSize: 14, color: "#555" },
  price: { fontSize: 15, color: "green", marginTop: 5 },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  notificationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  notificationButtonText: {
    fontSize: 12,
    color: "#495057",
    marginLeft: 4,
    fontWeight: "500",
  },
});
