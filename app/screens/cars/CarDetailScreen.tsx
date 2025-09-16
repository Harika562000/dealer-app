import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { addToCompare, addToWishlist } from "../../store/carSlice";

type RootStackParamList = {
  BrowseCars: undefined;
  CarDetails: { car: any };
  Compare: undefined;
  TestDrive: { car: any };
};

type CarDetailScreenProps = NativeStackScreenProps<RootStackParamList, "CarDetails">;

export default function CarDetailScreen({ route, navigation }: CarDetailScreenProps) {
  const { car } = route.params;
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{car.make} {car.model}</Text>
      <Text>Year: {car.year}</Text>
      <Text>Fuel: {car.fuel}</Text>
      <Text>Mileage: {car.mileage}</Text>
      <Text style={styles.price}>₹{car.price.toLocaleString()}</Text>

      <Button title="Add to Wishlist" onPress={() => dispatch(addToWishlist(car))} />
      <Button title="Add to Compare" onPress={() => dispatch(addToCompare(car))} />
      <Button title="Book Test Drive" onPress={() => navigation.navigate("TestDrive", { car })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 200, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold" },
  price: { fontSize: 18, color: "green", marginTop: 10 },
});
