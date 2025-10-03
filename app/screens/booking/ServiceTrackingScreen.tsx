import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { api } from "../../services/serviceApi";
import { RootState } from "../../store/store";
// Warranty validation functions
interface WarrantyValidationResult {
  isValid: boolean;
  status: 'active' | 'expired' | 'expiring_soon' | 'mileage_exceeded' | 'no_warranty';
  message: string;
  daysUntilExpiry?: number;
  mileageRemaining?: number;
  warnings: string[];
}

interface WarrantyStatus {
  isActive: boolean;
  isExpiringSoon: boolean;
  isMileageExceeded: boolean;
  coveragePercentage: number;
  recommendedActions: string[];
}

function validateWarranty(booking: any): WarrantyValidationResult {
  const warnings: string[] = [];
  
  if (!booking.warrantyInfo) {
    return {
      isValid: false,
      status: 'no_warranty',
      message: 'No warranty information available for this vehicle',
      warnings: ['Contact service center for warranty details']
    };
  }

  const warranty = booking.warrantyInfo;
  const now = new Date();
  const expiryDate = new Date(warranty.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return {
      isValid: false,
      status: 'expired',
      message: `Warranty expired ${Math.abs(daysUntilExpiry)} days ago`,
      daysUntilExpiry,
      warnings: ['Warranty has expired', 'Service costs may not be covered']
    };
  }

  if (daysUntilExpiry <= 30) {
    warnings.push(`Warranty expires in ${daysUntilExpiry} days`);
  }

  let mileageRemaining: number | undefined;
  if (warranty.mileageLimit && warranty.currentMileage) {
    mileageRemaining = warranty.mileageLimit - warranty.currentMileage;
    
    if (mileageRemaining < 0) {
      return {
        isValid: false,
        status: 'mileage_exceeded',
        message: `Warranty mileage limit exceeded by ${Math.abs(mileageRemaining).toLocaleString()} km`,
        daysUntilExpiry,
        mileageRemaining,
        warnings: ['Mileage limit exceeded', 'Warranty may not cover service costs']
      };
    }
    
    if (mileageRemaining <= 5000) {
      warnings.push(`Only ${mileageRemaining.toLocaleString()} km remaining on warranty`);
    }
  }

  let status: WarrantyValidationResult['status'] = 'active';
  if (daysUntilExpiry <= 30) {
    status = 'expiring_soon';
  }

  return {
    isValid: true,
    status,
    message: status === 'expiring_soon' 
      ? `Warranty expires in ${daysUntilExpiry} days`
      : 'Warranty is active and valid',
    daysUntilExpiry,
    mileageRemaining,
    warnings
  };
}

function getWarrantyStatus(booking: any): WarrantyStatus {
  const validation = validateWarranty(booking);
  const recommendedActions: string[] = [];

  if (!booking.warrantyInfo) {
    return {
      isActive: false,
      isExpiringSoon: false,
      isMileageExceeded: false,
      coveragePercentage: 0,
      recommendedActions: ['Contact service center for warranty information']
    };
  }

  const warranty = booking.warrantyInfo;
  const now = new Date();
  const expiryDate = new Date(warranty.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const isActive = daysUntilExpiry > 0;
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  
  let isMileageExceeded = false;
  if (warranty.mileageLimit && warranty.currentMileage) {
    isMileageExceeded = warranty.currentMileage > warranty.mileageLimit;
  }

  let coveragePercentage = 100;
  const totalWarrantyDays = 365 * 3;
  const daysUsed = totalWarrantyDays - daysUntilExpiry;
  const timeCoveragePercentage = Math.max(0, 100 - (daysUsed / totalWarrantyDays) * 100);
  
  let mileageCoveragePercentage = 100;
  if (warranty.mileageLimit && warranty.currentMileage) {
    mileageCoveragePercentage = Math.max(0, 100 - (warranty.currentMileage / warranty.mileageLimit) * 100);
  }
  
  coveragePercentage = Math.min(timeCoveragePercentage, mileageCoveragePercentage);

  if (isExpiringSoon) {
    recommendedActions.push('Schedule service before warranty expires');
    recommendedActions.push('Consider extended warranty options');
  }
  
  if (isMileageExceeded) {
    recommendedActions.push('Warranty mileage limit exceeded');
    recommendedActions.push('Service costs may not be covered');
  }
  
  if (coveragePercentage < 20) {
    recommendedActions.push('Warranty coverage is running low');
    recommendedActions.push('Plan for upcoming service needs');
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push('Warranty is in good standing');
    recommendedActions.push('Continue regular maintenance schedule');
  }

  return {
    isActive,
    isExpiringSoon,
    isMileageExceeded,
    coveragePercentage: Math.round(coveragePercentage),
    recommendedActions
  };
}

function getWarrantyStatusColor(status: WarrantyValidationResult['status']): string {
  switch (status) {
    case 'active':
      return '#27ae60';
    case 'expiring_soon':
      return '#f39c12';
    case 'expired':
    case 'mileage_exceeded':
      return '#e74c3c';
    case 'no_warranty':
      return '#95a5a6';
    default:
      return '#95a5a6';
  }
}

function getWarrantyStatusIcon(status: WarrantyValidationResult['status']): string {
  switch (status) {
    case 'active':
      return 'shield-checkmark';
    case 'expiring_soon':
      return 'shield-warning';
    case 'expired':
    case 'mileage_exceeded':
      return 'shield-close';
    case 'no_warranty':
      return 'shield-outline';
    default:
      return 'shield-outline';
  }
}

type RootStackParamList = {
  ServiceTracking: { bookingId: string };
  ServiceHistory: undefined;
  ServiceBooking: undefined;
};

type ServiceTrackingScreenProps = NativeStackScreenProps<RootStackParamList, "ServiceTracking">;

interface TrackingUpdate {
  id: string;
  timestamp: string;
  status: string;
  description: string;
  location?: string;
  technician?: string;
}

interface ServiceDetails {
  bookingId: string;
  serviceType: string;
  carDetails: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  currentStatus: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  estimatedCompletion?: string;
  cost?: number;
  trackingUpdates: TrackingUpdate[];
}

// Sample tracking data
const getSampleServiceDetails = (bookingId: string): ServiceDetails => {
  const baseData = {
    bookingId,
    serviceType: "Regular Maintenance",
    carDetails: "Toyota Corolla 2020, KA01AB1234",
    location: "Service Center Bangalore, Koramangala",
    scheduledDate: "2024-01-20",
    scheduledTime: "10:00 AM",
    currentStatus: "in_progress" as const,
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
      },
      {
        id: "3",
        timestamp: "2024-01-20 11:30 AM",
        status: "in_progress",
        description: "Oil change and filter replacement completed",
        location: "Service Bay 3",
        technician: "Rajesh Kumar"
      },
      {
        id: "4",
        timestamp: "2024-01-20 12:45 PM",
        status: "in_progress",
        description: "Brake system check in progress",
        location: "Service Bay 3",
        technician: "Rajesh Kumar"
      }
    ]
  };

  return baseData;
};

export default function ServiceTrackingScreen({ route, navigation }: ServiceTrackingScreenProps) {
  const { bookingId } = route.params;
  
  // Debug navigation params
  console.log('🔍 ServiceTrackingScreen - Route params:', route.params);
  console.log('🔍 ServiceTrackingScreen - Received bookingId:', bookingId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // Get service bookings from Redux store
  const serviceBookings = useSelector((state: RootState) => state.service.bookings);
  
  // Find the specific booking by bookingId
  const booking = serviceBookings.find(b => b.bookingId === bookingId);
  
  // Convert Redux booking to ServiceDetails format with enhanced tracking
  const serviceDetails: ServiceDetails | null = booking ? {
    bookingId: booking.bookingId,
    serviceType: booking.serviceType,
    carDetails: booking.carDetails,
    location: booking.location,
    scheduledDate: booking.date,
    scheduledTime: booking.time,
    currentStatus: booking.status === "confirmed" ? "scheduled" : booking.status as "completed" | "in_progress" | "scheduled" | "cancelled",
    estimatedCompletion: booking.nextServiceDue || "To be determined",
    cost: booking.cost || 0,
    trackingUpdates: generateServiceTimeline(booking),
  } : null;

  // Generate comprehensive service timeline
  function generateServiceTimeline(booking: any) {
    const timeline = [
      {
        id: "1",
        timestamp: booking.createdAt,
        status: "scheduled",
        description: "Service appointment created",
        location: booking.location,
        technician: "Service Team",
        details: "Your service appointment has been scheduled successfully."
      }
    ];

    // Add status-specific updates based on current status
    if (booking.status === "in_progress") {
      timeline.push({
        id: "2",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: "in_progress",
        description: "Service in progress",
        location: "Service Bay 3",
        technician: "Rajesh Kumar",
        details: "Vehicle inspection and service work has begun."
      });
    } else if (booking.status === "completed") {
      timeline.push(
        {
          id: "2",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          status: "in_progress",
          description: "Service in progress",
          location: "Service Bay 3",
          technician: "Rajesh Kumar",
          details: "Vehicle inspection and service work has begun."
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          status: "completed",
          description: "Service completed",
          location: "Service Bay 3",
          technician: "Rajesh Kumar",
          details: "All service work has been completed successfully. Vehicle is ready for pickup."
        }
      );
    }

    return timeline;
  }

  // Debug Redux state
  console.log('🔍 ServiceTrackingScreen - Looking for bookingId:', bookingId);
  console.log('🔍 ServiceTrackingScreen - All bookings:', serviceBookings);
  console.log('🔍 ServiceTrackingScreen - Found booking:', booking);
  console.log('🔍 ServiceTrackingScreen - Service details:', serviceDetails);
  console.log('🔍 ServiceTrackingScreen - Booking IDs in Redux:', serviceBookings.map(b => b.bookingId));
  console.log('🔍 ServiceTrackingScreen - Exact match check:', serviceBookings.find(b => b.bookingId === bookingId));
  console.log('🛡️ ServiceTrackingScreen - Booking warranty info:', booking?.warrantyInfo);

  // Warranty validation
  const warrantyValidation: WarrantyValidationResult | null = booking ? validateWarranty(booking) : null;
  const warrantyStatus = booking ? getWarrantyStatus(booking) : null;
  
  console.log('🛡️ Warranty Validation:', warrantyValidation);
  console.log('🛡️ Warranty Status:', warrantyStatus);

  // Load initial data
  useEffect(() => {
    const loadServiceDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!booking) {
          console.log('🔍 Booking not found in Redux, trying API fallback...');
          try {
            const apiData = await api.getBookingStatus(bookingId);
            console.log('🔍 API returned data:', apiData);
            // Note: We don't use this data since we're using Redux
          } catch (apiErr) {
            console.log('🔍 API also failed:', apiErr);
            setError(`Booking not found. Booking ID: ${bookingId}`);
          }
        }
      } catch (err) {
        console.error('Error loading service details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceDetails();
  }, [bookingId, booking]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#27ae60";
      case "in_progress":
        return "#f39c12";
      case "confirmed":
        return "#3498db";
      case "scheduled":
        return "#95a5a6";
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
      case "confirmed":
        return "checkmark";
      case "scheduled":
        return "calendar";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#27ae60";
      case "pending":
        return "#f39c12";
      case "partial":
        return "#3498db";
      default:
        return "#95a5a6";
    }
  };

  const handleEmailUpdate = async () => {
    try {
      await api.sendEmailNotification(bookingId, 'update');
      Alert.alert("Success", "Email notifications enabled for this service.");
      setShowEmailForm(false);
    } catch (error) {
      console.error('Error sending email notification:', error);
      Alert.alert("Error", "Failed to enable email notifications. Please try again.");
    }
  };

  const handleCallService = () => {
    Alert.alert(
      "Contact Service Center",
      "Call service center for immediate assistance?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Call",
          onPress: () => {
            // In a real app, this would initiate a phone call
            Alert.alert("Calling", "Connecting to service center...");
          }
        }
      ]
    );
  };

  const renderTrackingUpdate = (update: TrackingUpdate, index: number) => {
    if (!serviceDetails) return null;
    const isLast = index === serviceDetails.trackingUpdates.length - 1;
    
    return (
      <View key={update.id} style={styles.updateContainer}>
        <View style={styles.updateTimeline}>
          <View style={[
            styles.updateIcon,
            { backgroundColor: getStatusColor(update.status) }
          ]}>
            <Ionicons 
              name={getStatusIcon(update.status)} 
              size={16} 
              color="white" 
            />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>
        
        <View style={styles.updateContent}>
          <Text style={styles.updateTimestamp}>{update.timestamp}</Text>
          <Text style={styles.updateDescription}>{update.description}</Text>
          {update.location && (
            <Text style={styles.updateLocation}>📍 {update.location}</Text>
          )}
          {update.technician && (
            <Text style={styles.updateTechnician}>👨‍🔧 {update.technician}</Text>
          )}
        </View>
      </View>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Service Tracking</Text>
          <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#171C8F" />
          <Text style={styles.loadingText}>Loading service details...</Text>
        </View>
      </View>
    );
  }

  // Show error state or booking not found
  if (error || !serviceDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Service Tracking</Text>
          <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>
            {!serviceDetails ? "Booking Not Found" : "Unable to Load Service Details"}
          </Text>
          <Text style={styles.errorText}>
            {!serviceDetails 
              ? `No service booking found with ID: ${bookingId}. Please check the booking ID and try again.`
              : error
            }
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Service Tracking</Text>
        <Text style={styles.bookingId}>Booking ID: {serviceDetails.bookingId}</Text>
      </View>

      {/* Service Overview Cards */}
      <View style={styles.overviewContainer}>
        {/* Service Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name={getStatusIcon(serviceDetails.currentStatus)} size={24} color={getStatusColor(serviceDetails.currentStatus)} />
            <Text style={styles.statusTitle}>Service Status</Text>
          </View>
          <Text style={[styles.statusText, { color: getStatusColor(serviceDetails.currentStatus) }]}>
            {serviceDetails.currentStatus.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={styles.statusSubtext}>
            {serviceDetails.currentStatus === 'scheduled' && 'Your service appointment is confirmed'}
            {serviceDetails.currentStatus === 'in_progress' && 'Your vehicle is being serviced'}
            {serviceDetails.currentStatus === 'completed' && 'Service completed successfully'}
            {serviceDetails.currentStatus === 'cancelled' && 'Service appointment was cancelled'}
          </Text>
        </View>

        {/* Warranty Status Card */}
        {booking && (
          <View style={[styles.warrantyCard, warrantyValidation && { borderLeftColor: getWarrantyStatusColor(warrantyValidation.status), borderLeftWidth: 4 }]}>
            <View style={styles.warrantyHeader}>
              <Ionicons 
                name={warrantyValidation ? getWarrantyStatusIcon(warrantyValidation.status) as keyof typeof Ionicons.glyphMap : "shield-outline"} 
                size={24} 
                color={warrantyValidation ? getWarrantyStatusColor(warrantyValidation.status) : "#95a5a6"} 
              />
              <Text style={styles.warrantyTitle}>Warranty Status</Text>
            </View>
            
            {warrantyValidation && (
              <View style={styles.warrantyStatusBadge}>
                <Text style={[styles.warrantyStatusText, { color: getWarrantyStatusColor(warrantyValidation.status) }]}>
                  {warrantyValidation.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            )}
            
            {booking.warrantyInfo ? (
              <>
                <Text style={styles.warrantyType}>{booking.warrantyInfo.type.toUpperCase()} WARRANTY</Text>
                <Text style={styles.warrantyExpiry}>
                  Expires: {new Date(booking.warrantyInfo.expiryDate).toLocaleDateString()}
                </Text>
                {warrantyValidation?.daysUntilExpiry && (
                  <Text style={[styles.warrantyDaysRemaining, { color: getWarrantyStatusColor(warrantyValidation.status) }]}>
                    {warrantyValidation.daysUntilExpiry > 0 
                      ? `${warrantyValidation.daysUntilExpiry} days remaining`
                      : `Expired ${Math.abs(warrantyValidation.daysUntilExpiry)} days ago`
                    }
                  </Text>
                )}
                {booking.warrantyInfo.mileageLimit && (
                  <Text style={styles.warrantyMileage}>
                    Mileage Limit: {booking.warrantyInfo.mileageLimit.toLocaleString()} km
                  </Text>
                )}
                {warrantyValidation?.mileageRemaining && (
                  <Text style={[styles.warrantyMileageRemaining, { color: getWarrantyStatusColor(warrantyValidation.status) }]}>
                    {warrantyValidation.mileageRemaining > 0 
                      ? `${warrantyValidation.mileageRemaining.toLocaleString()} km remaining`
                      : `Mileage limit exceeded by ${Math.abs(warrantyValidation.mileageRemaining).toLocaleString()} km`
                    }
                  </Text>
                )}
                {warrantyStatus && (
                  <View style={styles.coverageBar}>
                    <Text style={styles.coverageBarLabel}>Coverage: {warrantyStatus.coveragePercentage}%</Text>
                    <View style={styles.coverageBarBackground}>
                      <View 
                        style={[
                          styles.coverageBarFill, 
                          { 
                            width: `${warrantyStatus.coveragePercentage}%`,
                            backgroundColor: getWarrantyStatusColor(warrantyValidation?.status || 'active')
                          }
                        ]} 
                      />
                    </View>
                  </View>
                )}
                <View style={styles.warrantyCoverage}>
                  <Text style={styles.coverageTitle}>Coverage:</Text>
                  {booking.warrantyInfo.coverage.map((item, index) => (
                    <Text key={index} style={styles.coverageItem}>• {item}</Text>
                  ))}
                </View>
                {warrantyValidation?.warnings && warrantyValidation.warnings.length > 0 && (
                  <View style={styles.warrantyWarnings}>
                    <Text style={styles.warningsTitle}>⚠️ Warnings:</Text>
                    {warrantyValidation.warnings.map((warning: string, index: number) => (
                      <Text key={index} style={styles.warningItem}>• {warning}</Text>
                    ))}
                  </View>
                )}
                {warrantyStatus?.recommendedActions && (
                  <View style={styles.recommendedActions}>
                    <Text style={styles.actionsTitle}>📋 Recommended Actions:</Text>
                    {warrantyStatus.recommendedActions.map((action: string, index: number) => (
                      <Text key={index} style={styles.actionItem}>• {action}</Text>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noWarrantyInfo}>
                <Text style={styles.noWarrantyText}>No warranty information available</Text>
                <Text style={styles.noWarrantySubtext}>Contact service center for warranty details</Text>
              </View>
            )}
          </View>
        )}

        {/* Service Reminders Card */}
        <View style={styles.remindersCard}>
          <View style={styles.remindersHeader}>
            <Ionicons name="alarm" size={24} color="#f39c12" />
            <Text style={styles.remindersTitle}>Service Reminders</Text>
          </View>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderType}>Next Service Due</Text>
            <Text style={styles.reminderDate}>
              {booking?.nextServiceDue ? new Date(booking.nextServiceDue).toLocaleDateString() : 'To be determined'}
            </Text>
          </View>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderType}>Oil Change</Text>
            <Text style={styles.reminderDate}>Due in 2,500 km</Text>
          </View>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderType}>Brake Inspection</Text>
            <Text style={styles.reminderDate}>Due in 5,000 km</Text>
          </View>
        </View>
      </View>

      {/* Service Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(serviceDetails.currentStatus)} 
              size={24} 
              color={getStatusColor(serviceDetails.currentStatus)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(serviceDetails.currentStatus) }]}>
              {serviceDetails.currentStatus.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.overviewContent}>
          <Text style={styles.serviceType}>{serviceDetails.serviceType}</Text>
          <Text style={styles.carDetails}>{serviceDetails.carDetails}</Text>
          <Text style={styles.location}>📍 {serviceDetails.location}</Text>
          <Text style={styles.schedule}>
            📅 {serviceDetails.scheduledDate} at {serviceDetails.scheduledTime}
          </Text>
          
          {serviceDetails.estimatedCompletion && (
            <Text style={styles.estimatedCompletion}>
              ⏰ Estimated completion: {serviceDetails.estimatedCompletion}
            </Text>
          )}
          
          {serviceDetails.cost && (
            <Text style={styles.cost}>💰 Estimated cost: ₹{serviceDetails.cost.toLocaleString()}</Text>
          )}
        </View>
      </View>

      {/* Service Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        <View style={styles.serviceInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service Type:</Text>
            <Text style={styles.infoValue}>{serviceDetails.serviceType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle:</Text>
            <Text style={styles.infoValue}>{serviceDetails.carDetails}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{serviceDetails.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Scheduled:</Text>
            <Text style={styles.infoValue}>{serviceDetails.scheduledDate} at {serviceDetails.scheduledTime}</Text>
          </View>
          {booking?.technician && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Technician:</Text>
              <Text style={styles.infoValue}>{booking.technician}</Text>
            </View>
          )}
          {booking?.serviceBay && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service Bay:</Text>
              <Text style={styles.infoValue}>{booking.serviceBay}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Cost Breakdown */}
      <View style={styles.costCard}>
        <Text style={styles.sectionTitle}>Cost Breakdown</Text>
        <View style={styles.costBreakdown}>
          {booking?.partsCost && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Parts:</Text>
              <Text style={styles.costValue}>₹{booking.partsCost.toLocaleString()}</Text>
            </View>
          )}
          {booking?.laborCost && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Labor:</Text>
              <Text style={styles.costValue}>₹{booking.laborCost.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Cost:</Text>
            <Text style={styles.totalValue}>
              ₹
              {(
                booking?.totalCost !== undefined && booking?.totalCost !== null
                  ? booking.totalCost
                  : serviceDetails.cost ?? 0
              ).toLocaleString()}
            </Text>
          </View>
          {booking?.paymentStatus && (
            <View style={styles.paymentStatus}>
              <Text style={styles.paymentLabel}>Payment Status:</Text>
              <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(booking.paymentStatus) }]}>
                <Text style={styles.paymentBadgeText}>{booking.paymentStatus.toUpperCase()}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Parts Used */}
      {booking?.partsUsed && booking.partsUsed.length > 0 && (
        <View style={styles.partsCard}>
          <Text style={styles.sectionTitle}>Parts Used</Text>
          <View style={styles.partsList}>
            {booking.partsUsed.map((part, index) => (
              <View key={index} style={styles.partItem}>
                <Ionicons name="construct" size={16} color="#171C8F" />
                <Text style={styles.partName}>{part}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEmailUpdate}>
          <Ionicons name="mail-outline" size={20} color="#171C8F" />
          <Text style={styles.actionButtonText}>Email Updates</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleCallService}>
          <Ionicons name="call-outline" size={20} color="#171C8F" />
          <Text style={styles.actionButtonText}>Call Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => {
            console.log('🔄 Refreshing warranty data...');
            // Force re-render by updating state
            setError(null);
          }}
        >
          <Ionicons name="refresh-outline" size={20} color="#171C8F" />
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Tracking Timeline */}
      <View style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>Service Progress</Text>
        
        {serviceDetails.trackingUpdates.map((update, index) => 
          renderTrackingUpdate(update, index)
        )}
      </View>

      {/* Additional Actions */}
      <View style={styles.additionalActions}>
        <TouchableOpacity 
          style={styles.additionalButton}
          onPress={() => navigation.navigate("ServiceHistory")}
        >
          <Ionicons name="time-outline" size={20} color="#171C8F" />
          <Text style={styles.additionalButtonText}>View All Services</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.additionalButton}
          onPress={() => navigation.navigate("ServiceBooking")}
        >
          <Ionicons name="add-circle-outline" size={20} color="#171C8F" />
          <Text style={styles.additionalButtonText}>Book Another Service</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  bookingId: {
    fontSize: 14,
    color: "#ecf0f1",
  },
  overviewCard: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overviewHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  overviewContent: {
    padding: 15,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  carDetails: {
    fontSize: 14,
    color: "#34495e",
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  schedule: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  estimatedCompletion: {
    fontSize: 14,
    color: "#f39c12",
    fontWeight: "500",
    marginBottom: 5,
  },
  cost: {
    fontSize: 16,
    fontWeight: "600",
    color: "#27ae60",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 15,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#171C8F",
    flex: 0.45,
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#171C8F",
    fontWeight: "500",
    marginLeft: 5,
  },
  timelineCard: {
    backgroundColor: "white",
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },
  updateContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  updateTimeline: {
    alignItems: "center",
    marginRight: 15,
  },
  updateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: "#ecf0f1",
    marginTop: 5,
  },
  updateContent: {
    flex: 1,
  },
  updateTimestamp: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
    marginBottom: 3,
  },
  updateDescription: {
    fontSize: 14,
    color: "#2c3e50",
    marginBottom: 3,
  },
  updateLocation: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  updateTechnician: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  additionalActions: {
    margin: 15,
    marginTop: 0,
  },
  additionalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  additionalButtonText: {
    fontSize: 16,
    color: "#171C8F",
    fontWeight: "500",
    marginLeft: 10,
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
  // New enhanced styles
  overviewContainer: {
    padding: 15,
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#2c3e50",
  },
  statusSubtext: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
  },
  warrantyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  warrantyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  warrantyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#2c3e50",
  },
  warrantyType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#27ae60",
    marginBottom: 5,
  },
  warrantyExpiry: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  warrantyMileage: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 10,
  },
  warrantyCoverage: {
    marginTop: 10,
  },
  coverageTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 5,
  },
  coverageItem: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 10,
  },
  remindersCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  remindersHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#2c3e50",
  },
  reminderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  reminderType: {
    fontSize: 14,
    color: "#2c3e50",
  },
  reminderDate: {
    fontSize: 14,
    color: "#f39c12",
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },
  serviceInfo: {
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  costCard: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  costBreakdown: {
    gap: 10,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  costLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  costValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#27ae60",
  },
  paymentStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  partsCard: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  partsList: {
    gap: 10,
  },
  partItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  partName: {
    fontSize: 14,
    color: "#2c3e50",
    marginLeft: 10,
  },
  // Enhanced warranty validation styles
  warrantyStatusBadge: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  warrantyStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  warrantyDaysRemaining: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  warrantyMileageRemaining: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  coverageBar: {
    marginTop: 10,
  },
  coverageBarLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 5,
  },
  coverageBarBackground: {
    height: 8,
    backgroundColor: "#ecf0f1",
    borderRadius: 4,
    overflow: "hidden",
  },
  coverageBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  warrantyWarnings: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 5,
  },
  warningItem: {
    fontSize: 12,
    color: "#856404",
    marginLeft: 10,
  },
  recommendedActions: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#d1ecf1",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#17a2b8",
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0c5460",
    marginBottom: 5,
  },
  actionItem: {
    fontSize: 12,
    color: "#0c5460",
    marginLeft: 10,
  },
  noWarrantyInfo: {
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  noWarrantyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
    textAlign: "center",
  },
  noWarrantySubtext: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 5,
  },
});
