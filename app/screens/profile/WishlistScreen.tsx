import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CarCard from "../../components/CarCard";
import { removeFromWishlist } from "../../store/carSlice";
import { RootState } from "../../store/store";

type RootStackParamList = {
  Wishlist: undefined; 
  CarDetails: { car: any };
};

type WishlistScreenProps = NativeStackScreenProps<RootStackParamList, "Wishlist">;

export default function WishlistScreen({ navigation }: WishlistScreenProps) {
  const dispatch = useDispatch();
  const wishlist = useSelector((state: RootState) => state.cars.wishlist);

  if (wishlist.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No cars in your wishlist.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={wishlist}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <CarCard
            car={item}
            onPress={() => navigation.navigate("CarDetails", { car: item })}
          />
          {/* <Button title="Remove" onPress={() => dispatch(removeFromWishlist(item.id))} /> */}
          <TouchableOpacity style={styles.removeButton} onPress={() => dispatch(removeFromWishlist(item.id))}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  removeButton: {
    marginTop: 10,
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  removeButtonText: { color: "#fff", fontWeight: "bold" },
});
