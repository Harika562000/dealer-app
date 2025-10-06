import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function ProfileScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'testDrives' | 'serviceHistory'>('testDrives');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'completed' | 'in_progress' | 'scheduled'>('all');
  
  const bookedDrives = useSelector(
    (state: RootState) => state.bookedTestDrives.drives
  );
  
  const serviceHistory = useSelector(
    (state: RootState) => state.service.bookings
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

  // Filter service history based on selected filter
  const filteredServiceHistory = serviceHistory.filter(record => 
    serviceFilter === "all" || record.status === serviceFilter
  );

  const renderFilterButton = (filterType: typeof serviceFilter, label: string) => {
    const isActive = serviceFilter === filterType;
    const count = serviceHistory.filter(r => r.status === filterType).length;
    
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setServiceFilter(filterType)}
      >
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label} {count > 0 && `(${count})`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderServiceRecord = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate("ServiceTracking", { bookingId: item.bookingId })}
    >
      <View style={styles.serviceCardHeader}>
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

      <View style={styles.serviceCardContent}>
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
        
        {item.additionalNotes && (
          <Text style={styles.notes}>{item.additionalNotes}</Text>
        )}
      </View>

      <View style={styles.serviceCardFooter}>
        <TouchableOpacity style={styles.trackButton}>
          <Ionicons name="eye-outline" size={16} color="#171C8F" />
          <Text style={styles.trackButtonText}>Track Status</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'testDrives' && styles.activeTab]}
          onPress={() => setActiveTab('testDrives')}
        >
          <Ionicons 
            name="car-sport" 
            size={20} 
            color={activeTab === 'testDrives' ? 'white' : '#7f8c8d'} 
          />
          <Text style={[styles.tabText, activeTab === 'testDrives' && styles.activeTabText]}>
            Test Drives
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'serviceHistory' && styles.activeTab]}
          onPress={() => setActiveTab('serviceHistory')}
        >
          <Ionicons 
            name="construct" 
            size={20} 
            color={activeTab === 'serviceHistory' ? 'white' : '#7f8c8d'} 
          />
          <Text style={[styles.tabText, activeTab === 'serviceHistory' && styles.activeTabText]}>
            Service History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'testDrives' ? (
        <View style={styles.content}>
          <Text style={styles.heading}>Booked Test Drives</Text>
          {bookedDrives.length === 0 ? (
            <Text style={styles.noData}>No test drives booked yet.</Text>
          ) : (
            <FlatList
              data={bookedDrives}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.row}>
                    {/* Left side */}
                    <View style={styles.left}>
                      <Text style={styles.dealerName}>{item.dealer.dealerName} Dealers</Text>
                      <Text style={styles.dealerLocation}>{item.dealer.location}</Text>
                      <Text style={styles.carName}>{item.car.make} {item.car.model}</Text>
                    </View>

                    {/* Right side */}
                    <View style={styles.right}>
                      <Text style={styles.testDriveDate}>{item.date}</Text>
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.serviceHeader}>
            <Text style={styles.heading}>Service History</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.reloadButton}
                onPress={() => {
                  // Reload functionality will be handled by Redux persist
                }}
              >
                <Ionicons name="refresh" size={16} color="white" />
                <Text style={styles.reloadButtonText}>Reload</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.newServiceButton}
                onPress={() => navigation.navigate("ServiceBooking")}
              >
                <Ionicons name="add" size={16} color="white" />
                <Text style={styles.newServiceButtonText}>New Booking</Text>
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
          
          {filteredServiceHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>No Service Records</Text>
              <Text style={styles.emptySubtitle}>
                {serviceFilter === "all" 
                  ? "You haven't booked any services yet."
                  : `No ${serviceFilter.replace("_", " ")} services found.`
                }
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate("ServiceBooking")}
              >
                <Text style={styles.emptyButtonText}>Book Your First Service</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredServiceHistory}
              keyExtractor={(item) => item.id}
              renderItem={renderServiceRecord}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.serviceListContent}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 8,
    margin: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#171C8F",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7f8c8d",
    marginLeft: 8,
  },
  activeTabText: {
    color: "white",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heading: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 16,
    color: "#2c3e50",
  },
  noData: { 
    fontSize: 16, 
    color: "#777",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flex: 2 },
  right: { flex: 1, alignItems: "flex-end" },
  dealerName: { fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  dealerLocation: { fontSize: 14, color: "#555", marginBottom: 2 },
  carName: { fontSize: 14, color: "#333" },
  testDriveDate: { fontWeight: "600", fontSize: 14 },
  time: { fontSize: 14, color: "#555" },
  
  // Service History Styles
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reloadButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  newServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171C8F",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  newServiceButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#ecf0f1",
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  filterButtonActive: {
    backgroundColor: "#171C8F",
    borderColor: "#171C8F",
  },
  filterButtonText: {
    color: "#7f8c8d",
    fontSize: 12,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "white",
    fontWeight: "600",
  },
  serviceListContent: {
    paddingBottom: 20,
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
  serviceCardHeader: {
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
  serviceCardContent: {
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
  serviceCardFooter: {
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
});
