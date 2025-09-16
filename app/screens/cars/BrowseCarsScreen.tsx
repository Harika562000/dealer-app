import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CarCard from "../../components/CarCard";
import { cars } from "../../services/dummyApi";

type RootStackParamList = {
  BrowseCars: undefined;
  CarDetails: { car: any };
  Compare: undefined;
  TradeInEstimation: undefined;
};

type BrowseCarsScreenProps = NativeStackScreenProps<RootStackParamList, "BrowseCars">;

export default function BrowseCarsScreen({ navigation }: BrowseCarsScreenProps) {
  return (
    <View style={styles.container}>
      {/* Trade-In Estimation Button */}
      <TouchableOpacity
        style={styles.tradeInButton}
        onPress={() => navigation.navigate("TradeInEstimation")}
      >
        <Ionicons name="calculator-outline" size={20} color="white" />
        <Text style={styles.tradeInButtonText}>Get Trade-In Value</Text>
      </TouchableOpacity>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CarCard car={item} onPress={() => navigation.navigate("CarDetails", { car: item })} />
        )}
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tradeInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tradeInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  flatList: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});