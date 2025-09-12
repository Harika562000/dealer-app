import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
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
          <Button title="Remove" onPress={() => dispatch(removeFromWishlist(item.id))} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { width: 200, flex: 1, justifyContent: "center", alignItems: "center" },
});
