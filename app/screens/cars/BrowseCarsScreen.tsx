import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import CarCard from "../../components/CarCard";
import { cars } from "../../services/dummyApi";

type RootStackParamList = {
  BrowseCars: undefined;
  CarDetails: { car: any };
  Compare: undefined;
};

type BrowseCarsScreenProps = NativeStackScreenProps<RootStackParamList, "BrowseCars">;

export default function BrowseCarsScreen({ navigation }: BrowseCarsScreenProps) {
  return (
    <FlatList
      data={cars}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CarCard car={item} onPress={() => navigation.navigate("CarDetails", { car: item })} />
      )}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
});