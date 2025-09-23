import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { addToCompare, addToWishlist } from "../../store/carSlice";
import { trackCarView, trackWishlistAction } from "../../store/userBehaviorSlice";

type RootStackParamList = {
  BrowseCars: undefined;
  CarDetails: { car: any };
  Compare: undefined;
  FinancePreApprovalForm: undefined;
  TestDrive: { car: any };
};

type CarDetailScreenProps = NativeStackScreenProps<RootStackParamList, "CarDetails">;

export default function CarDetailScreen({ route, navigation }: CarDetailScreenProps) {
  const { car } = route.params;
  const dispatch = useDispatch();
  const [viewStartTime] = useState(Date.now());

  useEffect(() => {
    // Track initial car view
    const trackView = () => {
      dispatch(trackCarView({
        carId: car.id,
        carMake: car.make,
        carModel: car.model,
        duration: 0, // Will be updated on unmount
        price: car.price,
        fuelType: car.fuel,
      }));
    };

    trackView();

    // Track view duration when component unmounts
    return () => {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000);
      dispatch(trackCarView({
        carId: car.id,
        carMake: car.make,
        carModel: car.model,
        duration,
        price: car.price,
        fuelType: car.fuel,
      }));
    };
  }, [car, dispatch, viewStartTime]);

  const handleAddToWishlist = () => {
    dispatch(addToWishlist(car));
    // Track wishlist action
    dispatch(trackWishlistAction({
      carId: car.id,
      action: 'add',
      carMake: car.make,
      carModel: car.model,
      price: car.price,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{car.make} {car.model}</Text>
      <Text>Year: {car.year}</Text>
      <Text>Fuel: {car.fuel}</Text>
      <Text>Mileage: {car.mileage}</Text>
      <Text style={styles.price}>₹{car.price.toLocaleString()}</Text>

      <Button title="Add to Wishlist" onPress={handleAddToWishlist} />
      <Button title="Add to Compare" onPress={() => dispatch(addToCompare(car))} />
      <Button title="Book Test Drive" onPress={() => navigation.navigate("TestDrive", { car })} />
      <Button title="Finance Pre-Approval" onPress={() => navigation.navigate("FinancePreApprovalForm")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 200, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold" },
  price: { fontSize: 18, color: "green", marginTop: 10 },
});
