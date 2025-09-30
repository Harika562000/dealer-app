import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { RecommendationResult } from "../services/recommendationService";
import { addUserFeedback } from "../store/recommendationSlice";

interface RecommendationCardProps {
  recommendation: RecommendationResult;
  onPress: () => void;
  onFeedback?: (action: 'like' | 'dislike' | 'not_interested') => void;
  showFeedback?: boolean;
  compact?: boolean;
}

export default function RecommendationCard({ 
  recommendation, 
  onPress, 
  onFeedback,
  showFeedback = true,
  compact = false 
}: RecommendationCardProps) {
  const dispatch = useDispatch();
  const { car, reasons, confidence, category } = recommendation;

  const handleFeedback = (action: 'like' | 'dislike' | 'not_interested') => {
    dispatch(addUserFeedback({
      carId: car.id,
      action,
      category,
    }));
    onFeedback?.(action);
  };

  const handleCardPress = () => {
    // Track view action
    dispatch(addUserFeedback({
      carId: car.id,
      action: 'view',
      category,
    }));
    onPress();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#27ae60';
    if (confidence >= 0.6) return '#f39c12';
    return '#95a5a6';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'similar':
        return 'copy-outline';
      case 'budget':
        return 'wallet-outline';
      case 'popular':
        return 'trending-up-outline';
      case 'new':
        return 'sparkles-outline';
      case 'brand_preference':
        return 'star-outline';
      default:
        return 'car-outline';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handleCardPress}>
        <Image source={typeof car.image === "string" ? { uri: car.image } : car.image} style={styles.compactImage} />
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {car.make} {car.model}
          </Text>
          <Text style={styles.compactPrice}>₹{car.price.toLocaleString()}</Text>
          <View style={styles.compactMeta}>
            <Ionicons name={getCategoryIcon(category)} size={12} color="#7f8c8d" />
            <Text style={styles.compactReason} numberOfLines={1}>
              {reasons[0] || 'Recommended'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handleCardPress}>
      {/* Header with category and confidence */}
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Ionicons name={getCategoryIcon(category)} size={14} color="#171C8F" />
          <Text style={styles.categoryText}>
            {category.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <View style={styles.confidenceBadge}>
          <View 
            style={[
              styles.confidenceDot, 
              { backgroundColor: getConfidenceColor(confidence) }
            ]} 
          />
          <Text style={styles.confidenceText}>
            {Math.round(confidence * 100)}% match
          </Text>
        </View>
      </View>

      {/* Car Image */}
      <View style={styles.imageContainer}>
        <Image source={typeof car.image === "string" ? { uri: car.image } : car.image} style={styles.carImage} />
        {car.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>

      {/* Car Info */}
      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>
          {car.make} {car.model} {car.year}
        </Text>
        
        <View style={styles.carDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer-outline" size={14} color="#7f8c8d" />
            <Text style={styles.detailText}>{car.mileage}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={14} color="#7f8c8d" />
            <Text style={styles.detailText}>{car.fuel}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="star" size={14} color="#f39c12" />
            <Text style={styles.detailText}>{car.rating}</Text>
          </View>
        </View>

        <Text style={styles.price}>₹{car.price.toLocaleString()}</Text>

        {/* Reasons */}
        <View style={styles.reasonsContainer}>
          {reasons.slice(0, 2).map((reason, index) => (
            <View key={index} style={styles.reasonBadge}>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Feedback Actions */}
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => handleFeedback('like')}
          >
            <Ionicons name="thumbs-up-outline" size={20} color="#27ae60" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => handleFeedback('dislike')}
          >
            <Ionicons name="thumbs-down-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => handleFeedback('not_interested')}
          >
            <Ionicons name="close-outline" size={20} color="#95a5a6" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    color: '#171C8F',
    fontWeight: '600',
    marginLeft: 4,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  confidenceText: {
    fontSize: 10,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  carImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  carInfo: {
    padding: 12,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  carDetails: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reasonBadge: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 11,
    color: '#57606f',
    fontWeight: '500',
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  feedbackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },

  // Compact styles
  compactCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    width: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 6,
    resizeMode: 'cover',
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  compactPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactReason: {
    fontSize: 10,
    color: '#7f8c8d',
    marginLeft: 4,
    flex: 1,
  },
});
