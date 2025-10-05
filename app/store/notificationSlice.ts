import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: string;
  type: 'price_drop' | 'new_arrival' | 'status_change' | 'wishlist_reminder' | 'service_reminder' | 'general';
  title: string;
  message: string;
  carId?: string;
  carName?: string;
  oldPrice?: number;
  newPrice?: number;
  timestamp: number;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface NotificationSettings {
  priceDropAlerts: boolean;
  newArrivalAlerts: boolean;
  statusChangeAlerts: boolean;
  wishlistReminders: boolean;
  serviceReminders: boolean;
  generalNotifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
  };
}

interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;
  unreadCount: number;
}

const initialSettings: NotificationSettings = {
  priceDropAlerts: true,
  newArrivalAlerts: true,
  statusChangeAlerts: true,
  wishlistReminders: true,
  serviceReminders: true,
  generalNotifications: true,
  pushNotifications: true,
  emailNotifications: false,
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
  },
};

// Sample notifications for demo
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "price_drop",
    title: "Price Drop Alert!",
    message: "Toyota Corolla 2022 price has dropped by ₹50,000",
    carId: "1",
    carName: "Toyota Corolla 2022",
    oldPrice: 1500000,
    newPrice: 1450000,
    timestamp: Date.now() - 3600000, // 1 hour ago
    isRead: false,
    priority: "high",
  },
  {
    id: "2",
    type: "new_arrival",
    title: "New Car Arrived!",
    message: "Honda Civic 2024 is now available in your preferred color",
    carId: "2",
    carName: "Honda Civic 2024",
    timestamp: Date.now() - 7200000, // 2 hours ago
    isRead: false,
    priority: "medium",
  },
  {
    id: "3",
    type: "status_change",
    title: "Car Status Updated",
    message: "Your test drive booking for Maruti Swift has been confirmed",
    carId: "3",
    carName: "Maruti Swift",
    timestamp: Date.now() - 86400000, // 1 day ago
    isRead: true,
    priority: "medium",
  },
  {
    id: "4",
    type: "wishlist_reminder",
    title: "Wishlist Reminder",
    message: "You have 3 cars in your wishlist. Check them out!",
    timestamp: Date.now() - 172800000, // 2 days ago
    isRead: true,
    priority: "low",
  },
  {
    id: "5",
    type: "service_reminder",
    title: "Service Reminder",
    message: "Your car service is due in 7 days. Book now to avoid delays.",
    timestamp: Date.now() - 259200000, // 3 days ago
    isRead: false,
    priority: "high",
  },
];

const initialState: NotificationState = {
  notifications: sampleNotifications,
  settings: initialSettings,
  unreadCount: 3, // Count of unread notifications
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id" | "timestamp" | "isRead">>
    ) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        isRead: false,
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        if (!notification.isRead) {
          notification.isRead = true;
        }
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    updateSettings: (
      state,
      action: PayloadAction<Partial<NotificationSettings>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    // Simulate price drop notification
    simulatePriceDrop: (
      state,
      action: PayloadAction<{
        carId: string;
        carName: string;
        oldPrice: number;
        newPrice: number;
      }>
    ) => {
      if (state.settings.priceDropAlerts) {
        const { carId, carName, oldPrice, newPrice } = action.payload;
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "price_drop",
          title: "Price Drop Alert!",
          message: `${carName} price has dropped by ₹${(
            oldPrice - newPrice
          ).toLocaleString()}`,
          carId,
          carName,
          oldPrice,
          newPrice,
          timestamp: Date.now(),
          isRead: false,
          priority: "high",
        };
        state.notifications.unshift(newNotification);
        state.unreadCount += 1;
      }
    },
    // Simulate new arrival notification
    simulateNewArrival: (
      state,
      action: PayloadAction<{ carId: string; carName: string }>
    ) => {
      if (state.settings.newArrivalAlerts) {
        const { carId, carName } = action.payload;
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "new_arrival",
          title: "New Car Arrived!",
          message: `${carName} is now available in your preferred color`,
          carId,
          carName,
          timestamp: Date.now(),
          isRead: false,
          priority: "medium",
        };
        state.notifications.unshift(newNotification);
        state.unreadCount += 1;
      }
    },
    // inside reducers of notificationSlice
    addTestDriveNotification: (
      state,
      action: PayloadAction<{
        carId: string;
        carName: string;
        dealerName: string;
        date: string;
        time: string;
      }>
    ) => {
      const { carId, carName, dealerName, date, time } = action.payload;

      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "status_change", // you can use 'general' too
        title: "Test Drive Booked",
        message: `Your test drive for ${carName} with ${dealerName} is scheduled on ${date} at ${time}.`,
        carId,
        carName,
        timestamp: Date.now(),
        isRead: false,
        priority: "medium",
      };

      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  updateSettings,
  simulatePriceDrop,
  simulateNewArrival,
  addTestDriveNotification, 
} = notificationSlice.actions;

export default notificationSlice.reducer;
