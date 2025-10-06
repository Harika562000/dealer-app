// Service API for handling service bookings, history, and tracking
import { API_CONFIG, API_ENDPOINTS, shouldUseMockApi } from '../config/api';

export interface ServiceBookingRequest {
  location: string;
  date: string;
  time: string;
  serviceType: string;
  carDetails: string;
  contactNumber: string;
  email?: string;
  additionalNotes?: string;
}

export interface ServiceBookingResponse {
  bookingId: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  estimatedCost?: number;
  confirmationEmail: boolean;
  message: string;
}

export interface ServiceTrackingData {
  bookingId: string;
  serviceType: string;
  carDetails: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  currentStatus: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  estimatedCompletion?: string;
  cost?: number;
  trackingUpdates: {
    id: string;
    timestamp: string;
    status: string;
    description: string;
    location?: string;
    technician?: string;
  }[];
}

export interface ServiceRecord {
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

// Use configured API base URL
const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to get auth token (implement based on your auth system)
const getAuthToken = (): string | null => {
  // In a real app, this would get the token from secure storage
  // For React Native, use AsyncStorage or secure storage
  return null; // Placeholder - implement proper token storage
};

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const serviceApi = {
  /**
   * Create a new service booking
   */
  async createBooking(bookingData: ServiceBookingRequest): Promise<ServiceBookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKINGS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(bookingData),
      });

      return await handleApiResponse(response);
    } catch (error) {
      throw new Error('Failed to create service booking. Please check your connection and try again.');
    }
  },

  /**
   * Get booking status and tracking information
   */
  async getBookingStatus(bookingId: string): Promise<ServiceTrackingData> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKING_STATUS(bookingId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      return await handleApiResponse(response);
    } catch (error) {
      throw new Error('Failed to fetch booking status. Please try again.');
    }
  },

  /**
   * Get user's service history
   */
  async getServiceHistory(): Promise<ServiceRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SERVICE_HISTORY}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      return await handleApiResponse(response);
    } catch (error) {
      throw new Error('Failed to fetch service history. Please try again.');
    }
  },

  /**
   * Cancel a service booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ reason }),
      });

      return await handleApiResponse(response);
    } catch (error) {
      throw new Error('Failed to cancel booking. Please try again.');
    }
  },

  /**
   * Update booking information
   */
  async updateBooking(bookingId: string, updates: Partial<ServiceBookingRequest>): Promise<ServiceBookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(updates),
      });

      return await handleApiResponse(response);
    } catch (error) {
      throw new Error('Failed to update booking. Please try again.');
    }
  },

  /**
   * Get available time slots for a specific date and location
   */
  async getAvailableTimeSlots(date: string, location: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/available-slots?date=${date}&location=${encodeURIComponent(location)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      return await handleApiResponse(response);
    } catch (error) {
      // Return default time slots if API fails
      return [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
      ];
    }
  },

  /**
   * Send email notification for booking updates
   */
  async sendEmailNotification(bookingId: string, type: 'confirmation' | 'reminder' | 'update'): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ type }),
      });

      return await handleApiResponse(response);
    } catch (error) {
      throw new Error('Failed to send notification. Please try again.');
    }
  }
};

// Mock implementation for development/testing
export const mockServiceApi = {
  async createBooking(bookingData: ServiceBookingRequest): Promise<ServiceBookingResponse> {
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate random success/failure for testing (disabled for normal use)
    // if (Math.random() < 0.1) { // 10% failure rate for testing
    //   throw new Error('Service temporarily unavailable. Please try again later.');
    // }

    const result = {
      bookingId: `SB${Date.now()}`,
      status: "scheduled" as const,
      estimatedCost: Math.floor(Math.random() * 5000) + 1000, // Random cost between 1000-6000
      confirmationEmail: true,
      message: "Service booking created successfully"
    };
    
    return result;
  },

  async getBookingStatus(bookingId: string): Promise<ServiceTrackingData> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      bookingId,
      serviceType: "Regular Maintenance",
      carDetails: "Toyota Corolla 2020, KA01AB1234",
      location: "Service Center Bangalore, Koramangala",
      scheduledDate: "2024-01-20",
      scheduledTime: "10:00 AM",
      currentStatus: "in_progress",
      estimatedCompletion: "2024-01-20 02:00 PM",
      cost: 2500,
      trackingUpdates: [
        {
          id: "1",
          timestamp: "2024-01-20 09:30 AM",
          status: "confirmed",
          description: "Service appointment confirmed",
          location: "Service Center Bangalore, Koramangala",
          technician: "Rajesh Kumar"
        },
        {
          id: "2",
          timestamp: "2024-01-20 10:15 AM",
          status: "in_progress",
          description: "Vehicle inspection started",
          location: "Service Bay 3",
          technician: "Rajesh Kumar"
        }
      ]
    };
  },

  async getServiceHistory(): Promise<ServiceRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
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
      }
    ];
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Booking cancelled successfully" };
  },

  async updateBooking(bookingId: string, updates: Partial<ServiceBookingRequest>): Promise<ServiceBookingResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      bookingId,
      status: "scheduled",
      estimatedCost: 2500,
      confirmationEmail: true,
      message: "Booking updated successfully"
    };
  },

  async getAvailableTimeSlots(date: string, location: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
      "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    ];
  },

  async sendEmailNotification(bookingId: string, type: 'confirmation' | 'reminder' | 'update'): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};

// Export the appropriate API based on configuration
const useMockApi = shouldUseMockApi();

export const api = useMockApi ? mockServiceApi : serviceApi;
