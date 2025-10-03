# Service API Integration

This document explains the Service & Maintenance Booking API integration in the dealer app.

## Overview

The service booking system now includes real API integration with fallback to mock data for development and testing.

## API Configuration

### Environment Setup

The API behavior is controlled by environment variables and configuration:

```typescript
// app/config/api.ts
export const API_CONFIG = {
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.dealerapp.com/v1',
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MOCK_DELAY: 1500,
  MOCK_FAILURE_RATE: 0.1,
};
```

### Switching Between Mock and Real API

- **Development Mode**: Uses mock API by default
- **Production Mode**: Uses real API endpoints
- **Override**: Set `REACT_APP_USE_MOCK_API=true` to force mock API

## API Endpoints

### Service Booking

#### Create Booking
```http
POST /api/bookings
Content-Type: application/json
Authorization: Bearer <token>

{
  "location": "Service Center Bangalore",
  "date": "2024-01-20",
  "time": "10:00 AM",
  "serviceType": "Regular Maintenance",
  "carDetails": "Toyota Corolla 2020, KA01AB1234",
  "contactNumber": "+91 9876543210",
  "email": "user@example.com",
  "additionalNotes": "Oil change and brake check"
}
```

**Response:**
```json
{
  "bookingId": "SB1703123456789",
  "status": "scheduled",
  "estimatedCost": 2500,
  "confirmationEmail": true,
  "message": "Service booking created successfully"
}
```

#### Get Booking Status
```http
GET /api/bookings/{bookingId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "bookingId": "SB1703123456789",
  "serviceType": "Regular Maintenance",
  "carDetails": "Toyota Corolla 2020, KA01AB1234",
  "location": "Service Center Bangalore, Koramangala",
  "scheduledDate": "2024-01-20",
  "scheduledTime": "10:00 AM",
  "currentStatus": "in_progress",
  "estimatedCompletion": "2024-01-20 02:00 PM",
  "cost": 2500,
  "trackingUpdates": [
    {
      "id": "1",
      "timestamp": "2024-01-20 09:30 AM",
      "status": "confirmed",
      "description": "Service appointment confirmed",
      "location": "Service Center Bangalore, Koramangala",
      "technician": "Rajesh Kumar"
    }
  ]
}
```

#### Get Service History
```http
GET /api/bookings/history
Authorization: Bearer <token>
```

#### Cancel Booking
```http
POST /api/bookings/{bookingId}/cancel
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Schedule conflict"
}
```

#### Send Email Notification
```http
POST /api/bookings/{bookingId}/notify
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "confirmation" | "reminder" | "update"
}
```

## Error Handling

The API includes comprehensive error handling:

### Network Errors
- Connection timeouts
- Network unavailability
- Server errors (5xx)

### Validation Errors
- Missing required fields
- Invalid data formats
- Business logic violations

### Authentication Errors
- Invalid or expired tokens
- Insufficient permissions

## Usage Examples

### Creating a Service Booking

```typescript
import { api } from '../services/serviceApi';

const bookingData = {
  location: "Service Center Bangalore",
  date: "2024-01-20",
  time: "10:00 AM",
  serviceType: "Regular Maintenance",
  carDetails: "Toyota Corolla 2020, KA01AB1234",
  contactNumber: "+91 9876543210",
  email: "user@example.com",
  additionalNotes: "Oil change and brake check"
};

try {
  const result = await api.createBooking(bookingData);
  console.log('Booking created:', result.bookingId);
} catch (error) {
  console.error('Booking failed:', error.message);
}
```

### Tracking Service Status

```typescript
try {
  const trackingData = await api.getBookingStatus('SB1703123456789');
  console.log('Current status:', trackingData.currentStatus);
} catch (error) {
  console.error('Failed to fetch status:', error.message);
}
```

## Redux Integration

The API calls are integrated with Redux for state management:

```typescript
// Dispatch booking to Redux store
dispatch(addServiceBooking({
  bookingId: result.bookingId,
  date: formData.date,
  time: formData.time,
  serviceType: formData.serviceType,
  carDetails: formData.carDetails,
  location: formData.location,
  contactNumber: formData.contactNumber,
  email: formData.email,
  additionalNotes: formData.additionalNotes,
  status: result.status,
  cost: result.estimatedCost,
}));
```

## Mock API Features

For development and testing, the mock API provides:

- **Realistic delays**: Simulates network latency
- **Random failures**: 10% failure rate for error testing
- **Sample data**: Pre-populated service history and tracking data
- **Consistent responses**: Predictable data for UI testing

## Production Deployment

To deploy with real API:

1. Set environment variables:
   ```bash
   NODE_ENV=production
   REACT_APP_API_URL=https://your-api-endpoint.com/v1
   ```

2. Implement authentication:
   - Update `getAuthToken()` function
   - Add token refresh logic
   - Handle authentication errors

3. Configure CORS and security:
   - Enable CORS for your domain
   - Implement rate limiting
   - Add request validation

## Testing

The API includes comprehensive error scenarios for testing:

- Network failures
- Invalid responses
- Authentication errors
- Validation failures

Use the mock API for consistent testing and the real API for integration testing.
