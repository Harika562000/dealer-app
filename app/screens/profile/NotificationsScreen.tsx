import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    clearAllNotifications,
    deleteNotification,
    markAllAsRead,
    markAsRead,
    Notification,
    updateSettings,
} from "../../store/notificationSlice";
import { RootState } from "../../store/store";

type NotificationScreenProps = {
  navigation: any;
  route: any;
};

export default function NotificationsScreen({ navigation }: NotificationScreenProps) {
  const dispatch = useDispatch();
  const { notifications, unreadCount, settings } = useSelector((state: RootState) => state.notifications);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'price_drop' | 'new_arrival' | 'status_change'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price_drop':
        return { name: 'trending-down' as const, color: '#e74c3c' };
      case 'new_arrival':
        return { name: 'car' as const, color: '#27ae60' };
      case 'status_change':
        return { name: 'information-circle' as const, color: '#3498db' };
      case 'wishlist_reminder':
        return { name: 'heart' as const, color: '#e91e63' };
      case 'service_reminder':
        return { name: 'construct' as const, color: '#f39c12' };
      default:
        return { name: 'notifications' as const, color: '#95a5a6' };
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
    
    // Navigate to car details if carId exists
    if (notification.carId) {
      // You can implement navigation to car details here
      console.log('Navigate to car:', notification.carId);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => dispatch(deleteNotification(notificationId)) },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: () => dispatch(clearAllNotifications()) },
      ]
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon.name} size={24} color={icon.color} />
              {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: priorityColor }]} />}
            </View>
            <View style={styles.notificationText}>
              <Text style={[styles.notificationTitle, !item.isRead && styles.unreadText]}>
                {item.title}
              </Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              {item.carName && (
                <Text style={styles.carName}>{item.carName}</Text>
              )}
              {item.oldPrice && item.newPrice && (
                <View style={styles.priceContainer}>
                  <Text style={styles.oldPrice}>₹{item.oldPrice.toLocaleString()}</Text>
                  <Text style={styles.newPrice}>₹{item.newPrice.toLocaleString()}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteNotification(item.id)}
            >
              <Ionicons name="close" size={20} color="#95a5a6" />
            </TouchableOpacity>
          </View>
          <View style={styles.notificationFooter}>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filterType: typeof filter, label: string, count?: number) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.activeFilter]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.settingsModal}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingsContent}>
            <Text style={styles.settingsSectionTitle}>Notification Types</Text>
            
            {Object.entries(settings).map(([key, value]) => {
              if (typeof value === 'boolean') {
                return (
                  <View key={key} style={styles.settingItem}>
                    <Text style={styles.settingLabel}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                    <TouchableOpacity
                      style={[styles.toggle, value && styles.toggleActive]}
                      onPress={() => dispatch(updateSettings({ [key]: !value }))}
                    >
                      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>
      </View>
    </Modal>
  );

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off" size={64} color="#bdc3c7" />
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptyMessage}>
          You'll receive notifications about price drops, new arrivals, and updates here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowSettings(true)}
            >
              <Ionicons name="settings" size={24} color="#3498db" />
            </TouchableOpacity>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleMarkAllAsRead}
              >
                <Ionicons name="checkmark-done" size={24} color="#27ae60" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClearAll}
            >
              <Ionicons name="trash" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All', notifications.length)}
          {renderFilterButton('unread', 'Unread', unreadCount)}
          {renderFilterButton('price_drop', 'Price Drops')}
          {renderFilterButton('new_arrival', 'New Arrivals')}
          {renderFilterButton('status_change', 'Updates')}
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      />

      {renderSettingsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "white",
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ecf0f1",
  },
  activeFilter: {
    backgroundColor: "#3498db",
  },
  filterText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  iconContainer: {
    position: "relative",
    marginRight: 12,
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: "bold",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
    marginBottom: 4,
  },
  carName: {
    fontSize: 12,
    color: "#3498db",
    fontWeight: "500",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  oldPrice: {
    fontSize: 12,
    color: "#95a5a6",
    textDecorationLine: "line-through",
  },
  newPrice: {
    fontSize: 14,
    color: "#27ae60",
    fontWeight: "600",
  },
  deleteButton: {
    padding: 4,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#95a5a6",
  },
  priorityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  settingsModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  settingsContent: {
    padding: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  settingLabel: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#bdc3c7",
    justifyContent: "center",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#3498db",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "white",
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
});
