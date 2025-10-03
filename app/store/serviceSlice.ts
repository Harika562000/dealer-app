import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ServiceBooking {
  id: string;
  bookingId: string;
  date: string;
  time: string;
  serviceType: string;
  carDetails: string;
  location: string;
  contactNumber: string;
  email?: string;
  additionalNotes?: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  cost?: number;
  warrantyExpiry?: string;
  nextServiceDue?: string;
  createdAt: string;
  // Enhanced tracking fields
  estimatedDuration?: string;
  actualDuration?: string;
  technician?: string;
  serviceBay?: string;
  partsUsed?: string[];
  laborHours?: number;
  partsCost?: number;
  laborCost?: number;
  totalCost?: number;
  paymentStatus?: "pending" | "paid" | "partial";
  warrantyInfo?: {
    type: "manufacturer" | "extended" | "service";
    expiryDate: string;
    mileageLimit?: number;
    currentMileage?: number;
    coverage: string[];
  };
}

export interface ServiceReminder {
  id: string;
  carDetails: string;
  serviceType: string;
  dueDate: string;
  isActive: boolean;
  reminderType: "email" | "push" | "both";
  createdAt: string;
}

export interface WarrantyInfo {
  id: string;
  carDetails: string;
  warrantyType: string;
  startDate: string;
  endDate: string;
  coverage: string[];
  isActive: boolean;
  mileageLimit?: number;
  currentMileage?: number;
}

interface ServiceState {
  bookings: ServiceBooking[];
  reminders: ServiceReminder[];
  warranties: WarrantyInfo[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  bookings: [
    {
      id: "1",
      bookingId: "SB1703123456",
      date: "2024-01-15",
      time: "10:00 AM",
      serviceType: "Regular Maintenance",
      carDetails: "Toyota Corolla 2020, KA01AB1234",
      location: "Service Center Bangalore, Koramangala",
      contactNumber: "+91 9876543210",
      email: "user@example.com",
      additionalNotes: "Oil change, filter replacement, brake check",
      status: "completed",
      cost: 2500,
      warrantyExpiry: "2025-12-31",
      nextServiceDue: "2024-04-15",
      createdAt: "2024-01-10T10:00:00Z",
      // Enhanced warranty information
      estimatedDuration: "2-3 hours",
      technician: "Rajesh Kumar",
      serviceBay: "Service Bay 2",
      partsUsed: ["Oil Filter", "Engine Oil 5W-30", "Air Filter", "Brake Pads"],
      laborHours: 2.5,
      partsCost: 1500,
      laborCost: 1000,
      totalCost: 2500,
      paymentStatus: "paid",
      warrantyInfo: {
        type: "manufacturer",
        expiryDate: "2025-12-31T00:00:00Z",
        mileageLimit: 100000,
        currentMileage: 35000,
        coverage: ["Engine", "Transmission", "Electrical Systems", "Air Conditioning", "Brake System"]
      }
    },
    {
      id: "2",
      bookingId: "SB1703123457",
      date: "2024-01-20",
      time: "02:00 PM",
      serviceType: "AC Service",
      carDetails: "Toyota Corolla 2020, KA01AB1234",
      location: "Service Center Bangalore, Koramangala",
      contactNumber: "+91 9876543210",
      email: "user@example.com",
      additionalNotes: "AC compressor check and refrigerant refill",
      status: "in_progress",
      cost: 1800,
      createdAt: "2024-01-15T14:30:00Z",
      // Enhanced warranty information
      estimatedDuration: "1-2 hours",
      technician: "Priya Sharma",
      serviceBay: "Service Bay 1",
      partsUsed: ["AC Filter", "Refrigerant R134a", "AC Compressor Oil"],
      laborHours: 1.5,
      partsCost: 1000,
      laborCost: 800,
      totalCost: 1800,
      paymentStatus: "pending",
      warrantyInfo: {
        type: "manufacturer",
        expiryDate: "2025-12-31T00:00:00Z",
        mileageLimit: 100000,
        currentMileage: 36000,
        coverage: ["Engine", "Transmission", "Electrical Systems", "Air Conditioning", "Brake System"]
      }
    },
    {
      id: "3",
      bookingId: "SB1703123458",
      date: "2024-02-01",
      time: "09:00 AM",
      serviceType: "Brake Service",
      carDetails: "Toyota Corolla 2020, KA01AB1234",
      location: "Service Center Bangalore, Koramangala",
      contactNumber: "+91 9876543210",
      email: "user@example.com",
      additionalNotes: "Brake pad replacement and brake fluid change",
      status: "scheduled",
      cost: 3200,
      createdAt: "2024-01-18T11:20:00Z",
      // Enhanced warranty information
      estimatedDuration: "3-4 hours",
      technician: "Amit Kumar",
      serviceBay: "Service Bay 3",
      partsUsed: ["Brake Pads (Front)", "Brake Pads (Rear)", "Brake Fluid DOT 4", "Brake Discs"],
      laborHours: 3.5,
      partsCost: 2000,
      laborCost: 1200,
      totalCost: 3200,
      paymentStatus: "pending",
      warrantyInfo: {
        type: "manufacturer",
        expiryDate: "2025-12-31T00:00:00Z",
        mileageLimit: 100000,
        currentMileage: 37000,
        coverage: ["Engine", "Transmission", "Electrical Systems", "Air Conditioning", "Brake System"]
      }
    }
  ],
  reminders: [
    {
      id: "1",
      carDetails: "Toyota Corolla 2020, KA01AB1234",
      serviceType: "Regular Maintenance",
      dueDate: "2024-04-15",
      isActive: true,
      reminderType: "both",
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "2",
      carDetails: "Toyota Corolla 2020, KA01AB1234",
      serviceType: "Oil Change",
      dueDate: "2024-03-01",
      isActive: true,
      reminderType: "email",
      createdAt: "2024-01-15T10:00:00Z"
    }
  ],
  warranties: [
    {
      id: "1",
      carDetails: "Toyota Corolla 2020, KA01AB1234",
      warrantyType: "Manufacturer Warranty",
      startDate: "2020-01-15",
      endDate: "2025-12-31",
      coverage: ["Engine", "Transmission", "Electrical Systems", "AC System"],
      isActive: true,
      mileageLimit: 100000,
      currentMileage: 45000
    },
    {
      id: "2",
      carDetails: "Toyota Corolla 2020, KA01AB1234",
      warrantyType: "Extended Warranty",
      startDate: "2025-12-31",
      endDate: "2027-12-31",
      coverage: ["Engine", "Transmission"],
      isActive: false,
      mileageLimit: 150000
    }
  ],
  isLoading: false,
  error: null,
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    // Service Booking Actions
    addServiceBooking: (state, action: PayloadAction<Omit<ServiceBooking, "id" | "createdAt">>) => {
      console.log('🔄 Redux: addServiceBooking action called with:', action.payload);
      const newBooking: ServiceBooking = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      console.log('🔄 Redux: Creating new booking:', newBooking);
      state.bookings.unshift(newBooking);
      console.log('🔄 Redux: Updated bookings array length:', state.bookings.length);
      console.log('💾 Redux: Data will be persisted to localStorage');
    },
    
    updateServiceBooking: (state, action: PayloadAction<{ id: string; updates: Partial<ServiceBooking> }>) => {
      const { id, updates } = action.payload;
      const index = state.bookings.findIndex(booking => booking.id === id);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...updates };
      }
    },
    
    cancelServiceBooking: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.bookings.findIndex(booking => booking.id === id);
      if (index !== -1) {
        state.bookings[index].status = "cancelled";
      }
    },
    
    // Service Reminder Actions
    addServiceReminder: (state, action: PayloadAction<Omit<ServiceReminder, "id" | "createdAt">>) => {
      const newReminder: ServiceReminder = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.reminders.unshift(newReminder);
    },
    
    updateServiceReminder: (state, action: PayloadAction<{ id: string; updates: Partial<ServiceReminder> }>) => {
      const { id, updates } = action.payload;
      const index = state.reminders.findIndex(reminder => reminder.id === id);
      if (index !== -1) {
        state.reminders[index] = { ...state.reminders[index], ...updates };
      }
    },
    
    deleteServiceReminder: (state, action: PayloadAction<string>) => {
      state.reminders = state.reminders.filter(reminder => reminder.id !== action.payload);
    },
    
    // Warranty Actions
    addWarranty: (state, action: PayloadAction<Omit<WarrantyInfo, "id">>) => {
      const newWarranty: WarrantyInfo = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.warranties.unshift(newWarranty);
    },
    
    updateWarranty: (state, action: PayloadAction<{ id: string; updates: Partial<WarrantyInfo> }>) => {
      const { id, updates } = action.payload;
      const index = state.warranties.findIndex(warranty => warranty.id === id);
      if (index !== -1) {
        state.warranties[index] = { ...state.warranties[index], ...updates };
      }
    },
    
    updateWarrantyMileage: (state, action: PayloadAction<{ id: string; currentMileage: number }>) => {
      const { id, currentMileage } = action.payload;
      const index = state.warranties.findIndex(warranty => warranty.id === id);
      if (index !== -1) {
        state.warranties[index].currentMileage = currentMileage;
        // Check if warranty is still active based on mileage
        if (state.warranties[index].mileageLimit && currentMileage > state.warranties[index].mileageLimit!) {
          state.warranties[index].isActive = false;
        }
      }
    },
    
    // Utility Actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear all service data (for testing/debugging)
    clearServiceData: (state) => {
      state.bookings = [];
      state.reminders = [];
      state.warranties = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  addServiceBooking,
  updateServiceBooking,
  cancelServiceBooking,
  addServiceReminder,
  updateServiceReminder,
  deleteServiceReminder,
  addWarranty,
  updateWarranty,
  updateWarrantyMileage,
  setLoading,
  setError,
  clearError,
  clearServiceData,
} = serviceSlice.actions;

export default serviceSlice.reducer;
