// API Configuration
export const API_CONFIG = {
  // Set to 'development' to use mock API, 'production' for real API
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  
  // Real API endpoints
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.dealerapp.com/v1',
  
  // API timeout settings
  TIMEOUT: 10000, // 10 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Mock API settings
  MOCK_DELAY: 1500, // Simulate network delay
  MOCK_FAILURE_RATE: 0.1, // 10% failure rate for testing
};

// Helper function to determine if we should use mock API
export const shouldUseMockApi = (): boolean => {
  return API_CONFIG.ENVIRONMENT === 'development' || 
         process.env.REACT_APP_USE_MOCK_API === 'true';
};

// API endpoints
export const API_ENDPOINTS = {
  BOOKINGS: '/bookings',
  BOOKING_STATUS: (id: string) => `/bookings/${id}`,
  BOOKING_CANCEL: (id: string) => `/bookings/${id}/cancel`,
  BOOKING_NOTIFY: (id: string) => `/bookings/${id}/notify`,
  SERVICE_HISTORY: '/bookings/history',
  AVAILABLE_SLOTS: '/bookings/available-slots',
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  USER_PROFILE: '/user/profile',
};
