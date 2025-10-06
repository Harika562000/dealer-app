import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { api, ServiceBookingRequest } from "../../services/serviceApi";
import { addServiceBooking } from "../../store/serviceSlice";

type RootStackParamList = {
  ServiceBooking: undefined;
  ServiceHistory: undefined;
  ServiceTracking: { bookingId: string };
};

type ServiceBookingScreenProps = NativeStackScreenProps<RootStackParamList, "ServiceBooking">;

interface ServiceBookingForm {
  location: string;
  date: string;
  time: string;
  serviceType: string;
  carDetails: string;
  contactNumber: string;
  email: string;
  additionalNotes: string;
}

const SERVICE_TYPES = [
  "Regular Maintenance",
  "Oil Change",
  "Brake Service",
  "Engine Check",
  "AC Service",
  "Battery Check",
  "Tire Service",
  "Transmission Service",
  "Electrical Check",
  "Other"
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

export default function ServiceBookingScreen({ navigation }: ServiceBookingScreenProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<ServiceBookingForm>({
    location: "",
    date: "",
    time: "",
    serviceType: "",
    carDetails: "",
    contactNumber: "",
    email: "",
    additionalNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [dropdownField, setDropdownField] = useState<keyof ServiceBookingForm | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const updateFormData = (field: keyof ServiceBookingForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openDropdown = (field: keyof ServiceBookingForm, options: string[]) => {
    setDropdownField(field);
    setDropdownOptions(options);
    setActiveDropdown(field);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
    setDropdownField(null);
    setDropdownOptions([]);
  };

  const selectOption = (option: string) => {
    if (dropdownField) {
      updateFormData(dropdownField, option);
    }
    closeDropdown();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    
    if (Platform.OS === 'web') {
      // For web, we'll handle it differently
      setShowDatePicker(false);
      if (selectedDate) {
        setSelectedDate(selectedDate);
        const formattedDate = selectedDate.toISOString().split('T')[0];
        updateFormData("date", formattedDate);
      }
    } else {
      setShowDatePicker(Platform.OS === 'ios');
      if (selectedDate) {
        setSelectedDate(selectedDate);
        const formattedDate = selectedDate.toISOString().split('T')[0];
        updateFormData("date", formattedDate);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderCalendarDays = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDay} />
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isPast = date < today && !isToday;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            isToday && styles.calendarDayToday,
            isPast && styles.calendarDayPast
          ]}
          onPress={() => {
            if (!isPast) {
              setSelectedDate(date);
            }
          }}
          disabled={isPast}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
            isToday && styles.calendarDayTextToday,
            isPast && styles.calendarDayTextPast
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const handleSubmit = async () => {
    
    // Validate required fields
    const requiredFields = ["location", "date", "time", "serviceType", "carDetails", "contactNumber"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof ServiceBookingForm]);
    
    if (missingFields.length > 0) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    // Validate email format if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare booking data for API
      const bookingData: ServiceBookingRequest = {
        location: formData.location,
        date: formData.date,
        time: formData.time,
        serviceType: formData.serviceType,
        carDetails: formData.carDetails,
        contactNumber: formData.contactNumber,
        email: formData.email || undefined,
        additionalNotes: formData.additionalNotes || undefined,
      };
      
      // Make API call to create booking
      const result = await api.createBooking(bookingData);
      
      // Dispatch to Redux store
      const bookingPayload = {
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
        // Enhanced tracking data
        estimatedDuration: "2-3 hours",
        technician: "Rajesh Kumar",
        serviceBay: "Service Bay 3",
        partsUsed: ["Oil Filter", "Engine Oil 5W-30", "Air Filter"],
        laborHours: 2.5,
        partsCost: Math.floor((result.estimatedCost || 0) * 0.6),
        laborCost: Math.floor((result.estimatedCost || 0) * 0.4),
        totalCost: result.estimatedCost || 0,
        paymentStatus: "pending" as const,
        warrantyInfo: {
          type: "manufacturer" as const,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          mileageLimit: 100000,
          currentMileage: 45000,
          coverage: ["Engine", "Transmission", "Electrical Systems", "Air Conditioning"]
        }
      };
      
      dispatch(addServiceBooking(bookingPayload));
      
      // Debug: Check if data is being saved to localStorage
      setTimeout(() => {
        const localStorageData = localStorage.getItem('persist:root');
        if (localStorageData) {
          try {
            const parsed = JSON.parse(localStorageData);
            const serviceData = parsed.service ? JSON.parse(parsed.service) : null;
          } catch (e) {
            console.log('💾 After dispatch - Error parsing localStorage:', e);
          }
        }
      }, 100);

      // Show success message with real booking ID
      const alertMessage = `Your service appointment has been booked successfully.\n\nBooking ID: ${result.bookingId}\n\nEstimated Cost: ${result.estimatedCost ? `₹${result.estimatedCost.toLocaleString()}` : 'To be determined'}\n\n${result.confirmationEmail ? 'You will receive a confirmation email shortly.' : ''}`;
      
      // Test if Alert.alert works
      try {
        Alert.alert(
          "Booking Confirmed!",
          alertMessage,
          [
            {
              text: "Track Status",
              onPress: () => {
                navigation.navigate("ServiceTracking", { bookingId: result.bookingId });
              },
            },
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setFormData({
                  location: "",
                  date: "",
                  time: "",
                  serviceType: "",
                  carDetails: "",
                  contactNumber: "",
                  email: "",
                  additionalNotes: "",
                });
              },
            },
          ]
        );
      } catch (alertError) {
        // Fallback: show a simple alert
        alert(`Booking Confirmed!\n\nBooking ID: ${result.bookingId}\n\nEstimated Cost: ₹${result.estimatedCost?.toLocaleString()}`);
      }
      
      // Also show success message in UI
      setShowSuccessMessage(true);
      setLastBookingId(result.bookingId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to book service appointment. Please try again.";
      Alert.alert("Booking Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDropdown = (
    label: string,
    field: keyof ServiceBookingForm,
    options: string[],
    required: boolean = false
  ) => {
    const isOpen = activeDropdown === field;
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TouchableOpacity
          style={styles.dropdownInput}
          onPress={() => openDropdown(field, options)}
        >
          <Text style={[
            styles.dropdownInputText,
            !formData[field] && styles.placeholderText
          ]}>
            {formData[field] || `Select ${label.toLowerCase()}`}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Service & Maintenance Booking</Text>
          <Text style={styles.subtitle}>
            Schedule your car service appointment
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Service Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            
            {renderDropdown("Service Type", "serviceType", SERVICE_TYPES, true)}
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Car Details <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.carDetails}
                onChangeText={(text) => updateFormData("carDetails", text)}
                placeholder="e.g., Toyota Corolla 2020, KA01AB1234"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.additionalNotes}
                onChangeText={(text) => updateFormData("additionalNotes", text)}
                placeholder="Any specific issues or requirements..."
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Appointment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => updateFormData("location", text)}
                placeholder="e.g., Service Center Bangalore, Koramangala"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  setShowDatePicker(true);
                }}
              >
                <Text style={[
                  styles.datePickerText,
                  !formData.date && styles.placeholderText
                ]}>
                  {formData.date ? formatDate(selectedDate) : "Select Date"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {renderDropdown("Time Slot", "time", TIME_SLOTS, true)}
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Contact Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.contactNumber}
                onChangeText={(text) => updateFormData("contactNumber", text)}
                placeholder="e.g., +91 9876543210"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                placeholder="e.g., user@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Success Message */}
          {showSuccessMessage && lastBookingId && (
            <View style={styles.successContainer}>
              <View style={styles.successHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
                <Text style={styles.successTitle}>Booking Confirmed!</Text>
              </View>
              <Text style={styles.successMessage}>
                Your service appointment has been booked successfully.
              </Text>
              <Text style={styles.bookingId}>Booking ID: {lastBookingId}</Text>
              <View style={styles.successActions}>
                <TouchableOpacity
                  style={[styles.button, styles.trackButton]}
                  onPress={() => {
                    
                    if (lastBookingId) {
                      try {
                        
                        // Try to get the parent navigation (CarStack)
                        const parentNavigation = navigation.getParent();
                        
                        if (parentNavigation) {
                          const result = parentNavigation.navigate("ServiceTracking", { bookingId: lastBookingId });
                        } else {
                          const result = navigation.navigate("ServiceTracking", { bookingId: lastBookingId });
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    } else {
                      console.error('lastBookingId is null or undefined');
                    }
                  }}
                >
                  <Ionicons name="eye-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Track Status</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.historyButton]}
                  onPress={() => navigation.navigate("ServiceHistory")}
                >
                  <Ionicons name="time-outline" size={20} color="#171C8F" />
                  <Text style={[styles.buttonText, styles.historyButtonText]}>View History</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => {
                  setShowSuccessMessage(false);
                  setLastBookingId(null);
                  // Reset form
                  setFormData({
                    location: "",
                    date: "",
                    time: "",
                    serviceType: "",
                    carDetails: "",
                    contactNumber: "",
                    email: "",
                    additionalNotes: "",
                  });
                }}
              >
                <Text style={styles.dismissButtonText}>Book Another Service</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={() => {
                try {
                  handleSubmit();
                } catch (error) {
                  console.error(error);
                }
              }}
              disabled={isSubmitting}
            >
              <Ionicons 
                name={isSubmitting ? "hourglass-outline" : "calendar-outline"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.buttonText}>
                {isSubmitting ? "Booking..." : "Book Service"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.historyButton]}
              onPress={() => navigation.navigate("ServiceHistory")}
            >
              <Ionicons name="time-outline" size={20} color="#171C8F" />
              <Text style={[styles.buttonText, styles.historyButtonText]}>Service History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Dropdown Modal */}
      {activeDropdown && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity onPress={closeDropdown}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              {dropdownOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    dropdownField && formData[dropdownField] === option && styles.selectedModalOption
                  ]}
                  onPress={() => selectOption(option)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    dropdownField && formData[dropdownField] === option && styles.selectedModalOptionText
                  ]}>
                    {option}
                  </Text>
                  {dropdownField && formData[dropdownField] === option && (
                    <Ionicons name="checkmark" size={20} color="#171C8F" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Date Picker */}
      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerModal}>
            <Text style={styles.datePickerTitle}>Select Date</Text>
            
            {/* Custom Calendar for Web */}
            {Platform.OS === 'web' ? (
              <View style={styles.customCalendar}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-back" size={24} color="#171C8F" />
                  </TouchableOpacity>
                  <Text style={styles.calendarMonth}>
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={24} color="#171C8F" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.calendarDays}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
                  ))}
                </View>
                
                <View style={styles.calendarGrid}>
                  {renderCalendarDays()}
                </View>
              </View>
            ) : (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={{ backgroundColor: 'white' }}
              />
            )}
            
            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={styles.datePickerCancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerDoneButton}
                onPress={() => {
                  const formattedDate = selectedDate.toISOString().split('T')[0];
                  updateFormData("date", formattedDate);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ecf0f1",
    lineHeight: 22,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#171C8F",
    paddingBottom: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#34495e",
    marginBottom: 8,
  },
  required: {
    color: "#e74c3c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
  },
  dropdownInputText: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  placeholderText: {
    color: "#95a5a6",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
  },
  datePickerText: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  datePickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  datePickerCancelButton: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerCancelText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerDoneButton: {
    flex: 1,
    backgroundColor: '#171C8F',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerDoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  customCalendar: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  calendarDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDaySelected: {
    backgroundColor: '#171C8F',
    borderRadius: 20,
  },
  calendarDayToday: {
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#171C8F',
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  calendarDayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  calendarDayTextToday: {
    color: '#171C8F',
    fontWeight: '600',
  },
  calendarDayTextPast: {
    color: '#bdc3c7',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#171C8F",
  },
  historyButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#171C8F",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "white",
  },
  historyButtonText: {
    color: "#171C8F",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 20,
    maxHeight: "70%",
    minWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  modalOptions: {
    maxHeight: 300,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedModalOption: {
    backgroundColor: "#f8f9fa",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  selectedModalOptionText: {
    color: "#171C8F",
    fontWeight: "500",
  },
  successContainer: {
    backgroundColor: "white",
    margin: 15,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#27ae60",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#27ae60",
    marginLeft: 8,
  },
  successMessage: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 10,
    lineHeight: 22,
  },
  bookingId: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 15,
    fontFamily: "monospace",
  },
  successActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  trackButton: {
    backgroundColor: "#27ae60",
    flex: 0.48,
  },
  dismissButton: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    alignItems: "center",
  },
  dismissButtonText: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
});
