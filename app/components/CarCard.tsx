import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: car.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{car.make} {car.model}</Text>
        <Text style={styles.details}>Year: {car.year} | {car.fuel}</Text>
        <Text style={styles.price}>₹{car.price.toLocaleString()}</Text>
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
});
