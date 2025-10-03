import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { api } from "../../services/serviceApi";
import { RootState } from "../../store/store";

type RootStackParamList = {
  ServiceHistory: undefined;
  ServiceTracking: { bookingId: string };
  ServiceBooking: undefined;
};

type ServiceHistoryScreenProps = NativeStackScreenProps<RootStackParamList, "ServiceHistory">;

interface ServiceRecord {
  id: string;
  bookingId: string;
  date: string;
  serviceType: string;
  carDetails: string;
  location: string;
  status: "completed" | "in_progress" | "scheduled" | "cancelled";
  cost?: number;
  warrantyExpiry?: string;
  nextServiceDue?: string;
  notes?: string;
}

// Sample service history data
const sampleServiceHistory: ServiceRecord[] = [
  {
    id: "1",
    bookingId: "SB1703123456",
    date: "2024-01-15",
    serviceType: "Regular Maintenance",
    carDetails: "Toyota Corolla 2020, KA01AB1234",
    location: "Service Center Bangalore, Koramangala",
    status: "completed",
    cost: 2500,
    warrantyExpiry: "2025-12-31",
    nextServiceDue: "2024-04-15",
    notes: "Oil change, filter replacement, brake check completed successfully."
  },
  {
    id: "2",
    bookingId: "SB1703123457",
    date: "2024-01-20",
    serviceType: "AC Service",
    carDetails: "Toyota Corolla 2020, KA01AB1234",
    location: "Service Center Bangalore, Koramangala",
    status: "in_progress",
    cost: 1800,
    notes: "AC compressor check and refrigerant refill in progress."
  },
  {
    id: "3",
    bookingId: "SB1703123458",
    date: "2024-02-01",
    serviceType: "Brake Service",
    carDetails: "Toyota Corolla 2020, KA01AB1234",
    location: "Service Center Bangalore, Koramangala",
    status: "scheduled",
    cost: 3200,
    notes: "Brake pad replacement and brake fluid change scheduled."
  },
  {
    id: "4",
    bookingId: "SB1703123459",
    date: "2023-12-10",
    serviceType: "Engine Check",
    carDetails: "Toyota Corolla 2020, KA01AB1234",
    location: "Service Center Bangalore, Koramangala",
    status: "completed",
    cost: 1500,
    notes: "Engine diagnostic check completed. No issues found."
  },
];

export default function ServiceHistoryScreen({ navigation }: ServiceHistoryScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "in_progress" | "scheduled">("all");
  
  // Get service history from Redux store
  const serviceHistory = useSelector((state: RootState) => state.service.bookings);
  
  // Debug Redux state
  console.log('📋 ServiceHistoryScreen - Redux bookings:', serviceHistory);
  console.log('📋 ServiceHistoryScreen - Number of bookings:', serviceHistory.length);
  console.log('💾 ServiceHistoryScreen - Data loaded from persistence:', serviceHistory.length > 0 ? 'Yes' : 'No');
  
  // Debug: Check localStorage directly
  const localStorageData = localStorage.getItem('persist:root');
  console.log('💾 localStorage data:', localStorageData ? 'Present' : 'Not found');
  if (localStorageData) {
    try {
      const parsed = JSON.parse(localStorageData);
      const serviceData = parsed.service ? JSON.parse(parsed.service) : null;
      console.log('💾 Service data in localStorage:', serviceData?.bookings?.length || 0, 'bookings');
    } catch (e) {
      console.log('💾 Error parsing localStorage:', e);
    }
  }
  
  // Debug: Show status distribution
  const statusCounts = serviceHistory.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('📊 Status distribution:', statusCounts);

  // Convert Redux bookings to ServiceRecord format
  const convertedServiceHistory: ServiceRecord[] = serviceHistory.map(booking => ({
    id: booking.id,
    bookingId: booking.bookingId,
    date: booking.date,
    serviceType: booking.serviceType,
    carDetails: booking.carDetails,
    location: booking.location,
    status: booking.status === "confirmed" ? "scheduled" : booking.status as "completed" | "in_progress" | "scheduled" | "cancelled",
    cost: booking.cost,
    warrantyExpiry: booking.warrantyExpiry,
    nextServiceDue: booking.nextServiceDue,
    notes: booking.additionalNotes,
  }));

  // Load initial data and handle API fallback
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If no bookings in Redux, try to load from API as fallback
        if (serviceHistory.length === 0) {
          console.log('📋 No bookings in Redux, loading from API...');
          const apiData = await api.getServiceHistory();
          // Note: We don't set this to state since we're using Redux
          // This is just to show that API is working
          console.log('📋 API returned:', apiData.length, 'bookings');
        }
        
      } catch (err) {
        console.error('Error loading service history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load service history');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [serviceHistory.length]);

  const filteredHistory = convertedServiceHistory.filter(record => 
    filter === "all" || record.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#27ae60";
      case "in_progress":
        return "#f39c12";
      case "scheduled":
        return "#3498db";
      case "cancelled":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "in_progress":
        return "time";
      case "scheduled":
        return "calendar";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const renderFilterButton = (filterType: typeof filter, label: string, count?: number) => {
    const isActive = filter === filterType;
    const displayCount = count !== undefined ? count : serviceHistory.filter(r => r.status === filterType).length;
    
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilter(filterType)}
      >
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label} {displayCount > 0 && `(${displayCount})`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderServiceRecord = ({ item }: { item: ServiceRecord }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate("ServiceTracking", { bookingId: item.bookingId })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={20} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace("_", " ").toUpperCase()}
          </Text>
        </View>
        <Text style={styles.bookingId}>#{item.bookingId}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.serviceType}>{item.serviceType}</Text>
        <Text style={styles.carDetails}>{item.carDetails}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.date}>Date: {item.date}</Text>
        
        {item.cost && (
          <Text style={styles.cost}>Cost: ₹{item.cost.toLocaleString()}</Text>
        )}
        
        {item.warrantyExpiry && (
          <View style={styles.warrantyContainer}>
            <Ionicons name="shield-checkmark" size={16} color="#27ae60" />
            <Text style={styles.warrantyText}>
              Warranty expires: {item.warrantyExpiry}
            </Text>
          </View>
        )}
        
        {item.nextServiceDue && (
          <View style={styles.nextServiceContainer}>
            <Ionicons name="calendar-outline" size={16} color="#3498db" />
            <Text style={styles.nextServiceText}>
              Next service due: {item.nextServiceDue}
            </Text>
          </View>
        )}
        
        {item.notes && (
          <Text style={styles.notes}>{item.notes}</Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.trackButton}>
          <Ionicons name="eye-outline" size={16} color="#171C8F" />
          <Text style={styles.trackButtonText}>Track Status</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Service History</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.reloadButton}
              onPress={() => {
                console.log('🔄 Clearing localStorage and reloading...');
                localStorage.clear();
                window.location.reload();
              }}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.reloadButtonText}>Reload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                console.log('🔍 Debug: Checking persistence status...');
                const localStorageData = localStorage.getItem('persist:root');
                console.log('🔍 localStorage data:', localStorageData ? 'Present' : 'Not found');
                if (localStorageData) {
                  try {
                    const parsed = JSON.parse(localStorageData);
                    const serviceData = parsed.service ? JSON.parse(parsed.service) : null;
                    console.log('🔍 Service data in localStorage:', serviceData);
                    console.log('🔍 Number of bookings in localStorage:', serviceData?.bookings?.length || 0);
                    console.log('🔍 Current Redux state:', serviceHistory);
                    console.log('🔍 Redux vs localStorage match:', serviceHistory.length === (serviceData?.bookings?.length || 0));
                  } catch (e) {
                    console.log('🔍 Error parsing localStorage:', e);
                  }
                }
              }}
            >
              <Ionicons name="bug" size={20} color="white" />
              <Text style={styles.debugButtonText}>Debug</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.newBookingButton}
              onPress={() => navigation.navigate("ServiceBooking")}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.newBookingButtonText}>New Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('scheduled', 'Scheduled')}
          {renderFilterButton('in_progress', 'In Progress')}
          {renderFilterButton('completed', 'Completed')}
        </View>
      </View>

      {/* Service History List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#171C8F" />
          <Text style={styles.loadingText}>Loading service history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Unable to Load Service History</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => window.location.reload()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceRecord}
          style={styles.historyList}
          contentContainerStyle={styles.historyListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>No Service Records</Text>
              <Text style={styles.emptySubtitle}>
                {filter === "all" 
                  ? "You haven't booked any services yet."
                  : `No ${filter.replace("_", " ")} services found.`
                }
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate("ServiceBooking")}
              >
                <Text style={styles.emptyButtonText}>Book Your First Service</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#2c3e50",
    padding: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  reloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  reloadButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  debugButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f39c12",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  debugButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  newBookingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171C8F",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  newBookingButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  filterButtonActive: {
    backgroundColor: "#171C8F",
    borderColor: "#171C8F",
  },
  filterButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    fontWeight: "600",
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    padding: 15,
  },
  serviceCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  bookingId: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  cardContent: {
    padding: 15,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 5,
  },
  carDetails: {
    fontSize: 14,
    color: "#34495e",
    marginBottom: 3,
  },
  location: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 3,
  },
  date: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  cost: {
    fontSize: 16,
    fontWeight: "600",
    color: "#27ae60",
    marginBottom: 8,
  },
  warrantyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  warrantyText: {
    fontSize: 12,
    color: "#27ae60",
    marginLeft: 5,
    fontWeight: "500",
  },
  nextServiceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  nextServiceText: {
    fontSize: 12,
    color: "#3498db",
    marginLeft: 5,
    fontWeight: "500",
  },
  notes: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
    marginTop: 5,
  },
  cardFooter: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  trackButtonText: {
    fontSize: 14,
    color: "#171C8F",
    fontWeight: "500",
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: "#171C8F",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 15,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#171C8F",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
