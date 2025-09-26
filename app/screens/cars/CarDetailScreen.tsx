import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCompare, addToWishlist } from "../../store/carSlice";
import { RootState } from "../../store/store";
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

  const compareList = useSelector((state: RootState) => state.cars.compareList);

  useEffect(() => {
    dispatch(trackCarView({
      carId: car.id,
      carMake: car.make,
      carModel: car.model,
      duration: 0,
      price: car.price,
      fuelType: car.fuel,
    }));

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
    dispatch(trackWishlistAction({
      carId: car.id,
      action: 'add',
      carMake: car.make,
      carModel: car.model,
      price: car.price,
    }));
    Alert.alert("Wishlist", "Car added to your wishlist!");
  };

  const handleAddToCompare = () => {
    const alreadyAdded = compareList.find((c: any) => c.id === car.id);
    if (alreadyAdded) {
      Alert.alert("Compare", "Car is already in compare list.");
      return;
    }
    if (compareList.length >= 3) {
      Alert.alert("Compare", "You can only compare up to 3 cars.");
      return;
    }
    dispatch(addToCompare(car));
    Alert.alert("Compare", "Car added to compare list!");
    navigation.navigate("Compare"); // optional
  };
  

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: car.image }} style={styles.image} />

      <Text style={styles.title}>{car.make} {car.model}</Text>
      <Text style={styles.price}>₹{car.price.toLocaleString()}</Text>
      <Text style={styles.originalPrice}>Original Price: ₹{car.originalPrice.toLocaleString()}</Text>

      <Text>Year: {car.year}</Text>
      <Text>Fuel: {car.fuel}</Text>
      <Text>Mileage: {car.mileage}</Text>
      <Text>Transmission: {car.transmission}</Text>
      <Text>Seating: {car.seating}</Text>
      <Text>Category: {car.category}</Text>

      <Text style={styles.featuresTitle}>Features:</Text>
      {car.features.map((feature: string, index: number) => (
        <Text key={index} style={styles.featureItem}>• {feature}</Text>
      ))}

      <Text style={styles.badges}>
        {car.seasonalOffer && "Seasonal Offer | "}
        {car.dealerPromotion && "Dealer Promotion | "}
        {car.isHotDeal && "Hot Deal | "}
        {car.isNewArrival && "New Arrival"}
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddToWishlist}>
          <Text style={styles.buttonText}>ADD TO WISHLIST</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleAddToCompare}>
          <Text style={styles.buttonText}>ADD TO COMPARE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("TestDrive", { car })}>
          <Text style={styles.buttonText}>BOOK TEST DRIVE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("FinancePreApprovalForm")}>
          <Text style={styles.buttonText}>FINANCE PRE-APPROVAL</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  image: { width: "100%", height: 220, borderRadius: 10, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  price: { fontSize: 20, color: "green", marginBottom: 5 },
  originalPrice: { fontSize: 16, color: "#888", marginBottom: 10, textDecorationLine: "line-through" },
  featuresTitle: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  featureItem: { fontSize: 14, marginLeft: 10 },
  badges: { marginVertical: 10, color: "red", fontWeight: "600" },
  buttonsContainer: {
    marginTop: 15,
    marginHorizontal: 15,
  },
  button: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10, // this creates the spacing
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
