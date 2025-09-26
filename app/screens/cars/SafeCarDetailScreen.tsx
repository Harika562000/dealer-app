import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ErrorBoundary, { ComponentErrorBoundary, ScreenErrorBoundary } from "../../components/ErrorBoundary";
import { useAutoRecommendationRefresh } from "../../hooks/useAutoRecommendationRefresh";
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

// Safe Car Image Component with Error Boundary
const SafeCarImage = ({ car }: { car: any }) => (
  <ComponentErrorBoundary componentName="CarImage">
    <Image 
      source={{ uri: car.image }} 
      style={styles.image}
      onError={(error) => {
        console.log('Image load error:', error);
      }}
    />
  </ComponentErrorBoundary>
);

// Safe Car Details Component with Error Boundary
const SafeCarDetails = ({ car }: { car: any }) => (
  <ComponentErrorBoundary componentName="CarDetails">
    <View>
      <Text style={styles.title}>{car?.make} {car?.model}</Text>
      <Text style={styles.price}>₹{car?.price?.toLocaleString()}</Text>
      <Text style={styles.originalPrice}>
        Original Price: ₹{car?.originalPrice?.toLocaleString()}
      </Text>

      <Text>Year: {car?.year || 'N/A'}</Text>
      <Text>Fuel: {car?.fuel || 'N/A'}</Text>
      <Text>Mileage: {car?.mileage || 'N/A'}</Text>
      <Text>Transmission: {car?.transmission || 'N/A'}</Text>
      <Text>Seating: {car?.seating || 'N/A'}</Text>
      <Text>Category: {car?.category || 'N/A'}</Text>
    </View>
  </ComponentErrorBoundary>
);

// Safe Features Component with Error Boundary
const SafeCarFeatures = ({ car }: { car: any }) => (
  <ComponentErrorBoundary componentName="CarFeatures">
    <View>
      <Text style={styles.featuresTitle}>Features:</Text>
      {car?.features?.map((feature: string, index: number) => (
        <Text key={index} style={styles.featureItem}>• {feature}</Text>
      )) || <Text style={styles.featureItem}>No features listed</Text>}
    </View>
  </ComponentErrorBoundary>
);

// Safe Badges Component with Error Boundary
const SafeCarBadges = ({ car }: { car: any }) => (
  <ComponentErrorBoundary componentName="CarBadges">
    <Text style={styles.badges}>
      {car?.seasonalOffer && "Seasonal Offer | "}
      {car?.dealerPromotion && "Dealer Promotion | "}
      {car?.isHotDeal && "Hot Deal | "}
      {car?.isNewArrival && "New Arrival"}
    </Text>
  </ComponentErrorBoundary>
);

// Safe Action Buttons Component with Error Boundary
const SafeActionButtons = ({ 
  car, 
  navigation, 
  onAddToWishlist, 
  onAddToCompare 
}: { 
  car: any; 
  navigation: any; 
  onAddToWishlist: () => void; 
  onAddToCompare: () => void; 
}) => (
  <ComponentErrorBoundary componentName="ActionButtons">
    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.button} onPress={onAddToWishlist}>
        <Text style={styles.buttonText}>ADD TO WISHLIST</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onAddToCompare}>
        <Text style={styles.buttonText}>ADD TO COMPARE</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("TestDrive", { car })}
      >
        <Text style={styles.buttonText}>BOOK TEST DRIVE</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("FinancePreApprovalForm")}
      >
        <Text style={styles.buttonText}>FINANCE PRE-APPROVAL</Text>
      </TouchableOpacity>
    </View>
  </ComponentErrorBoundary>
);

// Main CarDetailScreen Component
function CarDetailScreenContent({ route, navigation }: CarDetailScreenProps) {
  const { car } = route.params;
  const dispatch = useDispatch();
  const { compareList } = useSelector((state: any) => state.cars);
  const [viewStartTime] = useState(Date.now());

  // Auto-refresh recommendations when user views a car (most aggressive refresh)
  useAutoRecommendationRefresh({
    enabled: true,
    debounceMs: 1500, // 1.5 second delay for immediate updates
    significantChangeThreshold: 1 // Refresh after viewing 1 car
  });

  useEffect(() => {
    try {
      dispatch(trackCarView({
        carId: car?.id,
        carMake: car?.make,
        carModel: car?.model,
        duration: 0,
        price: car?.price,
        fuelType: car?.fuel,
      }));

      return () => {
        try {
          const duration = Math.floor((Date.now() - viewStartTime) / 1000);
          dispatch(trackCarView({
            carId: car?.id,
            carMake: car?.make,
            carModel: car?.model,
            duration,
            price: car?.price,
            fuelType: car?.fuel,
          }));
        } catch (error) {
          console.error('Error tracking car view on unmount:', error);
        }
      };
    } catch (error) {
      console.error('Error tracking car view on mount:', error);
    }
  }, [car, dispatch, viewStartTime]);

  const handleAddToWishlist = () => {
    try {
      dispatch(addToWishlist(car));
      dispatch(trackWishlistAction({
        carId: car?.id,
        action: 'add',
        carMake: car?.make,
        carModel: car?.model,
        price: car?.price,
      }));
      Alert.alert("Wishlist", "Car added to your wishlist!");
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert("Error", "Failed to add car to wishlist. Please try again.");
    }
  };

  const handleAddToCompare = () => {
    try {
      const alreadyAdded = compareList?.find((c: any) => c?.id === car?.id);
      if (alreadyAdded) {
        Alert.alert("Compare", "Car is already in compare list.");
        return;
      }
      if (compareList?.length >= 3) {
        Alert.alert("Compare", "You can only compare up to 3 cars.");
        return;
      }
      dispatch(addToCompare(car));
      Alert.alert("Compare", "Car added to compare list!");
      navigation.navigate("Compare");
    } catch (error) {
      console.error('Error adding to compare:', error);
      Alert.alert("Error", "Failed to add car to compare list. Please try again.");
    }
  };

  // Defensive programming: Handle missing car data
  if (!car) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Car details not found</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <SafeCarImage car={car} />
      <SafeCarDetails car={car} />
      <SafeCarFeatures car={car} />
      <SafeCarBadges car={car} />
      <SafeActionButtons 
        car={car}
        navigation={navigation}
        onAddToWishlist={handleAddToWishlist}
        onAddToCompare={handleAddToCompare}
      />
    </ScrollView>
  );
}

// Exported component wrapped with Screen-level Error Boundary
export default function CarDetailScreen(props: CarDetailScreenProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('CarDetailScreen Error:', error);
    console.error('Error Info:', errorInfo);
    
    // In a real app, send to crash reporting service
    // crashlytics().recordError(error);
    
    // Track error in analytics
    // analytics.track('car_detail_error', {
    //   error_message: error.message,
    //   car_id: props.route.params?.car?.id
    // });
  };

  return (
    <ScreenErrorBoundary>
      <ErrorBoundary 
        onError={handleError}
        resetKeys={[props.route.params?.car?.id]} // Reset if car changes
      >
        <CarDetailScreenContent {...props} />
      </ErrorBoundary>
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  image: { 
    width: "100%", 
    height: 220, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 5 
  },
  price: { 
    fontSize: 20, 
    color: "green", 
    marginBottom: 5 
  },
  originalPrice: { 
    fontSize: 16, 
    color: "#888", 
    marginBottom: 10, 
    textDecorationLine: "line-through" 
  },
  featuresTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginTop: 10 
  },
  featureItem: { 
    fontSize: 14, 
    marginLeft: 10 
  },
  badges: { 
    marginVertical: 10, 
    color: "red", 
    fontWeight: "600" 
  },
  buttonsContainer: {
    marginTop: 15,
    marginHorizontal: 15,
  },
  button: {
    backgroundColor: "#171C8F",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
});