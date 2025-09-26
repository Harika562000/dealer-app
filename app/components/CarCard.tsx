import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import {
  triggerNewArrivalNotification,
  triggerPriceDropNotification,
} from "../utils/notificationHelpers";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  fuel: string;
  mileage: string;
  image: string;
  seasonalOffer?: boolean;
  dealerPromotion?: boolean;
  isHotDeal?: boolean;
  isNewArrival?: boolean;
  transmission?: string;
  category?: string;
  seating?: number;
  features?: string[];
}

interface CarCardProps {
  car: Car;
  onPress: () => void;
}

export default function CarCard({ car, onPress }: CarCardProps) {
  const dispatch = useDispatch();

  const handlePriceDropAlert = () => {
    triggerPriceDropNotification(dispatch, car);
  };

  const handleNewArrivalAlert = () => {
    triggerNewArrivalNotification(dispatch, car);
  };

  const discountPercent =
    car.originalPrice && car.originalPrice > car.price
      ? Math.round(((car.originalPrice - car.price) / car.originalPrice) * 100)
      : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Image source={{ uri: car.image }} style={styles.image} />
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}
        {car.isHotDeal && (
          <View style={styles.hotDealBadge}>
            <Text style={styles.badgeText}>Hot Deal</Text>
          </View>
        )}
        {car.isNewArrival && (
          <View style={styles.newBadge}>
            <Text style={styles.badgeText}>New Arrival</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>
          {car.make} {car.model}
        </Text>
        <Text style={styles.details}>
          Year: {car.year} | {car.fuel} | {car.mileage}
        </Text>

        {/* Prices */}
        <View style={styles.priceContainer}>
          {discountPercent > 0 && (
            <Text style={styles.originalPrice}>
              ₹{car.originalPrice?.toLocaleString()}
            </Text>
          )}
          <Text style={styles.price}>₹{car.price.toLocaleString()}</Text>
        </View>

        {/* Promo tags */}
        <View style={styles.promoTags}>
          {car.seasonalOffer && (
            <Text style={styles.promoTag}>Seasonal Offer</Text>
          )}
          {car.dealerPromotion && (
            <Text style={styles.promoTag}>Dealer Promo</Text>
          )}
        </View>

        {/* Notification buttons */}
        <Text style={styles.title}>{car.make} {car.model}</Text>
        <Text style={styles.details}>Year: {car.year} | {car.fuel} | {car.mileage}</Text>
        {car.category && <Text style={styles.category}>{car.category}</Text>}
        {car.transmission && <Text style={styles.transmission}>{car.transmission} | {car.seating || 5} Seater</Text>}
        <Text style={styles.price}>₹{car.price.toLocaleString('en-IN')}</Text>
        
        {/* Features */}
        {car.features && car.features.length > 0 && (
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresText}>
              {car.features.slice(0, 2).join(' • ')}
            </Text>
          </View>
        )}
        
        {/* Notification Action Buttons */}
        <View style={styles.notificationActions}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handlePriceDropAlert}
          >
            <Ionicons name="trending-down" size={16} color="#e74c3c" />
            <Text style={styles.notificationButtonText}>Price Alert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNewArrivalAlert}
          >
            <Ionicons name="car" size={16} color="#27ae60" />
            <Text style={styles.notificationButtonText}>New Alert</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3,
    overflow: "hidden",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 6,
  },
  originalPrice: {
    fontSize: 14,
    color: "#888",
    textDecorationLine: "line-through",
  },
  promoTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  promoTag: {
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    color: "#343a40",
  },
  image: { width: "100%", height: 180, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  info: { padding: 10 },
  category: { fontSize: 12, color: "#007bff", fontWeight: "500", marginTop: 2 },
  transmission: { fontSize: 12, color: "#6c757d", marginTop: 2 },
  price: { fontSize: 15, color: "green", marginTop: 5, fontWeight: "bold" },
  featuresContainer: { marginTop: 5 },
  featuresText: { fontSize: 11, color: "#6c757d", fontStyle: "italic" },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  notificationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  notificationButtonText: {
    fontSize: 12,
    color: "#495057",
    marginLeft: 4,
    fontWeight: "500",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#d63031",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  hotDealBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadge: {
    position: "absolute",
    top: 40,
    left: 10,
    backgroundColor: "#3498db",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
