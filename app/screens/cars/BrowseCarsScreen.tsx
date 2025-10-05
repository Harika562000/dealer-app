import { filterVehicles } from "@/app/utils/helpers/common";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import CarCard from "../../components/CarCard";
import { useAutoRecommendationRefresh } from "../../hooks/useAutoRecommendationRefresh";
import { recommendationService } from "../../services/recommendationService";
import { trackSearch } from "../../store/userBehaviorSlice";
import LottieView from 'lottie-react-native';

type RootStackParamList = {
  BrowseCars: undefined;
  CarDetails: { car: any };
  Compare: undefined;
  TradeInEstimation: undefined;
  EmiCalculator: undefined;
  FinancePreApprovalForm: undefined;
  ChatScreen: undefined;
};

type BrowseCarsScreenProps = NativeStackScreenProps<RootStackParamList, "BrowseCars">;

export default function BrowseCarsScreen({ navigation }: BrowseCarsScreenProps) {
  const dispatch = useDispatch();
  const [cars, setCars] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<"all" | "new" | "preowned">("all");

  // Auto-refresh recommendations when user browses cars
  useAutoRecommendationRefresh({
    enabled: true,
    debounceMs: 3000, // 3 second delay
    significantChangeThreshold: 2 // Refresh after viewing 2 cars
  });

  useEffect(() => {
    // Load cars from service
    const loadedCars = recommendationService.getCars();
    setCars(loadedCars);
    setFilteredCars(loadedCars);
  }, []);

  useEffect(() => {
    let updatedCars = cars;
  
    // Search filter
    if (searchQuery.trim()) {
      updatedCars = recommendationService.searchCars(searchQuery);
    }
  
    // Vehicle type filter using robust function
    updatedCars = filterVehicles(updatedCars, vehicleFilter);
  
    setFilteredCars(updatedCars);
  
    // Track search
    if (searchQuery.trim()) {
      dispatch(
        trackSearch({
          query: searchQuery,
          filters: {}, // or include your active filters
          resultsCount: updatedCars.length,
        })
      );
    }
  }, [searchQuery, cars, vehicleFilter, dispatch]);  

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

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            vehicleFilter === "all" && styles.filterButtonActive
          ]}
          onPress={() => setVehicleFilter("all")}
        >
          <Text style={[
            styles.filterButtonText,
            vehicleFilter === "all" && { color: "#FFF" },
          ]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            vehicleFilter === "new" && styles.filterButtonActive
          ]}
          onPress={() => setVehicleFilter("new")}
        >
          <Text style={[
            styles.filterButtonText,
            vehicleFilter === "new" && { color: "#FFF" },
          ]}>New</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            vehicleFilter === "preowned" && styles.filterButtonActive
          ]}
          onPress={() => setVehicleFilter("preowned")}
        >
          <Text style={[
            styles.filterButtonText,
            vehicleFilter === "preowned" && { color: "#FFF" },
          ]}>Pre-Owned</Text>
        </TouchableOpacity>
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
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          backgroundColor: '#fff',
          borderRadius: 50,
          padding: 10,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => navigation.navigate('ChatScreen')}
      >
        <LottieView
          source={require('../../../assets/lottie/bubble.json')} // download a Lottie JSON from lottiefiles.com
          autoPlay
          loop
          style={{ width: 60, height: 60 }}
        />
      </TouchableOpacity>
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
    backgroundColor: '#171C8F',
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 15,
    marginTop: 5,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#171C8F",
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: "#171C8F",
  },
  filterButtonText: {
    color: "#171C8F",
    fontWeight: "600",
  },  
});
