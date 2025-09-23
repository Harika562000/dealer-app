import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import CarCard from "../../components/CarCard";
import { recommendationService } from "../../services/recommendationService";
import { trackSearch } from "../../store/userBehaviorSlice";

type RootStackParamList = {
  BrowseCars: undefined;
  CarDetails: { car: any };
  Compare: undefined;
  TradeInEstimation: undefined;
  EmiCalculator: undefined;
  FinancePreApprovalForm: undefined;
};

type BrowseCarsScreenProps = NativeStackScreenProps<RootStackParamList, "BrowseCars">;

export default function BrowseCarsScreen({ navigation }: BrowseCarsScreenProps) {
  const dispatch = useDispatch();
  const [cars, setCars] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCars, setFilteredCars] = useState<any[]>([]);

  useEffect(() => {
    // Load cars from service
    const loadedCars = recommendationService.getCars();
    setCars(loadedCars);
    setFilteredCars(loadedCars);
  }, []);

  useEffect(() => {
    // Filter cars based on search
    if (searchQuery.trim()) {
      const filtered = recommendationService.searchCars(searchQuery);
      setFilteredCars(filtered);
      
      // Track search behavior
      dispatch(trackSearch({
        query: searchQuery,
        filters: {},
        resultsCount: filtered.length,
      }));
    } else {
      setFilteredCars(cars);
    }
  }, [searchQuery, cars, dispatch]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cars by make, model, or fuel type..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#7f8c8d"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>

      {/* Trade-In Estimation Button */}
      <TouchableOpacity
        style={styles.tradeInButton}
        onPress={() => navigation.navigate("TradeInEstimation")}
      >
        <Ionicons name="calculator-outline" size={20} color="white" />
        <Text style={styles.tradeInButtonText}>Get Trade-In Value</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={styles.tradeInButton}
        onPress={() => navigation.navigate("EmiCalculator")}
      >
        <Ionicons name="calculator-outline" size={20} color="white" />
        <Text style={styles.tradeInButtonText}>Calculate EMI</Text>
      </TouchableOpacity>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredCars.length} car{filteredCars.length !== 1 ? 's' : ''} found
        </Text>
      </View>


      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CarCard car={item} onPress={() => navigation.navigate("CarDetails", { car: item })} />
        )}
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  tradeInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    margin: 15,
    marginTop: 5,
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
  resultsHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});