import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import RecommendationSection from "../../components/RecommendationSection";
import { useAutoRecommendationRefresh } from "../../hooks/useAutoRecommendationRefresh";
import {
  clearRecommendations,
  reorderSectionsByEngagement,
} from "../../store/recommendationSlice";
import { RootState, store } from "../../store/store";
import { refreshRecommendations } from "../../utils/recommendationHelpers";

type RecommendationsScreenProps = {
  navigation: any;
};

export default function RecommendationsScreen({ navigation }: RecommendationsScreenProps) {
  const dispatch = useDispatch();
  const { sections, globalLoading, isInitialized, enabledSections } = useSelector((state: RootState) => state.recommendations);
  const { carViews } = useSelector((state: RootState) => state.userBehavior);
  
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh recommendations when user behavior changes
  useAutoRecommendationRefresh({
    enabled: true,
    debounceMs: 2000, // 2 second delay after behavior change
    significantChangeThreshold: 1 // Refresh after viewing 1 new car
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Use a function that provides fresh state each call
      await refreshRecommendations(dispatch, () => store.getState());
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    // Initialize recommendations on first load only
    if (!isInitialized && !globalLoading) {
      handleRefresh();
    }
  }, [isInitialized, globalLoading, handleRefresh]);

  const handleCarPress = (car: any) => {
    navigation.navigate("CarDetails", { car });
  };

  const handleViewAllPress = (category: string) => {
    // Navigate to filtered cars screen or show modal with all recommendations
    console.log(`View all ${category} recommendations`);
  };

  const handleSmartReorder = () => {
    dispatch(reorderSectionsByEngagement());
  };

  const handleClearRecommendations = () => {
    dispatch(clearRecommendations());
    setTimeout(() => handleRefresh(), 500);
  };

  const getVisibleSections = () => {
    return enabledSections
      .map(sectionKey => ({
        key: sectionKey,
        section: sections[sectionKey as keyof typeof sections]
      }))
      .filter(({ section }) => section && section.recommendations.length > 0);
  };

  const visibleSections = getVisibleSections();

  // Header component with actions
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>For You</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSmartReorder}
          >
            <Ionicons name="shuffle" size={20} color="#171C8F" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearRecommendations}
          >
            <Ionicons name="refresh" size={20} color="#171C8F" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.headerSubtitle}>
        Personalized recommendations based on your preferences and browsing history
      </Text>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{carViews.length}</Text>
          <Text style={styles.statLabel}>Cars Viewed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{visibleSections.length}</Text>
          <Text style={styles.statLabel}>Sections</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {visibleSections.reduce((total, { section }) => total + section.recommendations.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Recommendations</Text>
        </View>
      </View>
    </View>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={80} color="#bdc3c7" />
      <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
      <Text style={styles.emptyMessage}>
        Start browsing cars to get personalized recommendations tailored just for you!
      </Text>
      <TouchableOpacity
        style={styles.browseCarsButton}
        onPress={() => navigation.navigate("Cars")}
      >
        <Ionicons name="search" size={20} color="white" />
        <Text style={styles.browseCarsText}>Browse Cars</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderHeader()}

      {visibleSections.length === 0 && !globalLoading ? (
        renderEmptyState()
      ) : (
        visibleSections.map(({ key, section }) => (
          <RecommendationSection
            key={key}
            title={section.title}
            category={section.category}
            recommendations={section.recommendations}
            isLoading={section.isLoading}
            onViewAll={() => handleViewAllPress(section.category)}
            onCarPress={handleCarPress}
            layout="vertical"
            maxItems={3}
          />
        ))
      )}

      {/* Debug info in development */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>
            Enabled Sections: {enabledSections.join(', ')}
          </Text>
          <Text style={styles.debugText}>
            Last Refresh: {new Date(sections.similar.lastUpdated).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#171C8F',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  browseCarsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171C8F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseCarsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  debugContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#34495e',
    borderRadius: 8,
  },
  debugTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  debugText: {
    color: '#bdc3c7',
    fontSize: 12,
    marginBottom: 2,
  },
});