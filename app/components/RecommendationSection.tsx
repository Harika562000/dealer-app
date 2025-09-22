import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch } from "react-redux";
import { RecommendationResult } from "../services/recommendationService";
import { addUserFeedback } from "../store/recommendationSlice";
import RecommendationCard from "./RecommendationCard";

interface RecommendationSectionProps {
  title: string;
  category: string;
  recommendations: RecommendationResult[];
  isLoading: boolean;
  onViewAll?: () => void;
  onCarPress: (car: any) => void;
  showViewAll?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
  maxItems?: number;
}

export default function RecommendationSection({
  title,
  category,
  recommendations,
  isLoading,
  onViewAll,
  onCarPress,
  showViewAll = true,
  layout = 'horizontal',
  maxItems = 5,
}: RecommendationSectionProps) {
  const dispatch = useDispatch();

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
      case 'trending':
        return 'flame-outline';
      default:
        return 'car-outline';
    }
  };

  const handleFeedback = (carId: string, action: 'like' | 'dislike' | 'not_interested') => {
    dispatch(addUserFeedback({
      carId,
      action,
      category,
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name={getCategoryIcon(category)} size={20} color="#3498db" />
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      </View>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name={getCategoryIcon(category)} size={20} color="#3498db" />
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={48} color="#bdc3c7" />
          <Text style={styles.emptyText}>No recommendations available</Text>
          <Text style={styles.emptySubtext}>
            Browse more cars to get personalized recommendations
          </Text>
        </View>
      </View>
    );
  }

  const displayedRecommendations = recommendations.slice(0, maxItems);

  const renderRecommendationItem = ({ item, index }: { item: RecommendationResult; index: number }) => (
    <RecommendationCard
      key={item.car.id}
      recommendation={item}
      onPress={() => onCarPress(item.car)}
      onFeedback={(action) => handleFeedback(item.car.id, action)}
      compact={layout === 'horizontal'}
      showFeedback={layout !== 'horizontal'}
    />
  );

  if (layout === 'horizontal') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name={getCategoryIcon(category)} size={20} color="#3498db" />
            <Text style={styles.title}>{title}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{recommendations.length}</Text>
            </View>
          </View>
          {showViewAll && recommendations.length > maxItems && (
            <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#3498db" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          style={styles.horizontalScrollView}
        >
          {displayedRecommendations.map((item, index) => renderRecommendationItem({ item, index }))}
        </ScrollView>
      </View>
    );
  }

  if (layout === 'grid') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name={getCategoryIcon(category)} size={20} color="#3498db" />
            <Text style={styles.title}>{title}</Text>
          </View>
          {showViewAll && recommendations.length > maxItems && (
            <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#3498db" />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={displayedRecommendations}
          renderItem={renderRecommendationItem}
          keyExtractor={(item) => item.car.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.gridList}
        />
      </View>
    );
  }

  // Vertical layout (default)
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name={getCategoryIcon(category)} size={20} color="#3498db" />
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{recommendations.length}</Text>
          </View>
        </View>
        {showViewAll && recommendations.length > maxItems && (
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#3498db" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={displayedRecommendations}
        renderItem={renderRecommendationItem}
        keyExtractor={(item) => item.car.id}
        scrollEnabled={false}
        contentContainerStyle={styles.verticalList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#7f8c8d',
    fontSize: 14,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#95a5a6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  horizontalScrollView: {
    marginHorizontal: -16,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  verticalList: {
    paddingBottom: 8,
  },
  gridList: {
    paddingBottom: 8,
  },
});