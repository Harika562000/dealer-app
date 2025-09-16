import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TradeInForm {
  make: string;
  model: string;
  year: string;
  mileage: string;
  condition: string;
  fuelType: string;
  transmission: string;
  color: string;
  registrationNumber: string;
  ownerCount: string;
  accidentHistory: string;
}

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const TRANSMISSION_TYPES = ["Manual", "Automatic", "CVT"];
const CONDITION_OPTIONS = ["Excellent", "Good", "Fair", "Poor"];
const OWNER_OPTIONS = ["1st Owner", "2nd Owner", "3rd Owner", "4th+ Owner"];
const ACCIDENT_OPTIONS = ["No Accident", "Minor Accident", "Major Accident"];

export default function TradeInEstimationScreen() {
  const [formData, setFormData] = useState<TradeInForm>({
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition: "",
    fuelType: "",
    transmission: "",
    color: "",
    registrationNumber: "",
    ownerCount: "",
    accidentHistory: "",
  });

  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [dropdownField, setDropdownField] = useState<keyof TradeInForm | null>(null);

  const updateFormData = (field: keyof TradeInForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTradeInValue = async () => {
    // Validate required fields
    const requiredFields = ["make", "model", "year", "mileage", "condition", "fuelType"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof TradeInForm]);
    
    if (missingFields.length > 0) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    setIsCalculating(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate estimated value based on car details
      const baseValue = calculateBaseValue();
      const adjustedValue = applyAdjustments(baseValue);
      
      setEstimatedValue(adjustedValue);
    } catch (error) {
      Alert.alert("Error", "Failed to calculate trade-in value. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateBaseValue = (): number => {
    const year = parseInt(formData.year);
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    // Base value calculation (simplified)
    let baseValue = 500000; // Starting base value
    
    // Adjust based on make/model (simplified logic)
    const makeModel = `${formData.make} ${formData.model}`.toLowerCase();
    if (makeModel.includes("toyota") || makeModel.includes("honda")) {
      baseValue = 800000;
    } else if (makeModel.includes("maruti") || makeModel.includes("hyundai")) {
      baseValue = 600000;
    } else if (makeModel.includes("bmw") || makeModel.includes("mercedes")) {
      baseValue = 1500000;
    }

    // Age depreciation (10% per year)
    const depreciation = baseValue * (age * 0.1);
    return Math.max(baseValue - depreciation, baseValue * 0.2); // Minimum 20% of base value
  };

  const applyAdjustments = (baseValue: number): number => {
    let adjustedValue = baseValue;

    // Mileage adjustment
    const mileage = parseInt(formData.mileage);
    if (mileage > 100000) {
      adjustedValue *= 0.8; // 20% reduction for high mileage
    } else if (mileage > 50000) {
      adjustedValue *= 0.9; // 10% reduction for medium mileage
    }

    // Condition adjustment
    switch (formData.condition) {
      case "Excellent":
        adjustedValue *= 1.1; // 10% premium
        break;
      case "Good":
        adjustedValue *= 1.0; // No change
        break;
      case "Fair":
        adjustedValue *= 0.85; // 15% reduction
        break;
      case "Poor":
        adjustedValue *= 0.7; // 30% reduction
        break;
    }

    // Owner count adjustment
    if (formData.ownerCount === "1st Owner") {
      adjustedValue *= 1.05; // 5% premium
    } else if (formData.ownerCount === "3rd Owner" || formData.ownerCount === "4th+ Owner") {
      adjustedValue *= 0.9; // 10% reduction
    }

    // Accident history adjustment
    if (formData.accidentHistory === "Major Accident") {
      adjustedValue *= 0.7; // 30% reduction
    } else if (formData.accidentHistory === "Minor Accident") {
      adjustedValue *= 0.9; // 10% reduction
    }

    return Math.round(adjustedValue);
  };

  const resetForm = () => {
    setFormData({
      make: "",
      model: "",
      year: "",
      mileage: "",
      condition: "",
      fuelType: "",
      transmission: "",
      color: "",
      registrationNumber: "",
      ownerCount: "",
      accidentHistory: "",
    });
    setEstimatedValue(null);
  };

  const openDropdown = (field: keyof TradeInForm, options: string[]) => {
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

  const renderDropdown = (
    label: string,
    field: keyof TradeInForm,
    options: string[],
    required: boolean = false
  ) => {
    const isOpen = activeDropdown === field;
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.dropdownContainer}>
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
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity 
        style={styles.scrollView} 
        activeOpacity={1}
        onPress={closeDropdown}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Trade-In Estimation</Text>
          <Text style={styles.subtitle}>
            Enter your car details to get an instant trade-in valuation
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Make <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.make}
                onChangeText={(text) => updateFormData("make", text)}
                placeholder="e.g., Toyota, Honda, Maruti"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Model <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.model}
                onChangeText={(text) => updateFormData("model", text)}
                placeholder="e.g., Corolla, Civic, Swift"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Year <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.year}
                onChangeText={(text) => updateFormData("year", text)}
                placeholder="e.g., 2020"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mileage (km) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.mileage}
                onChangeText={(text) => updateFormData("mileage", text)}
                placeholder="e.g., 50000"
                keyboardType="numeric"
              />
            </View>

            {renderDropdown("Condition", "condition", CONDITION_OPTIONS, true)}
            {renderDropdown("Fuel Type", "fuelType", FUEL_TYPES, true)}
            {renderDropdown("Transmission", "transmission", TRANSMISSION_TYPES)}
          </View>

          {/* Additional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={formData.color}
                onChangeText={(text) => updateFormData("color", text)}
                placeholder="e.g., White, Black, Silver"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Registration Number</Text>
              <TextInput
                style={styles.input}
                value={formData.registrationNumber}
                onChangeText={(text) => updateFormData("registrationNumber", text.toUpperCase())}
                placeholder="e.g., KA01AB1234"
                autoCapitalize="characters"
              />
            </View>

            {renderDropdown("Owner Count", "ownerCount", OWNER_OPTIONS)}
            {renderDropdown("Accident History", "accidentHistory", ACCIDENT_OPTIONS)}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.calculateButton]}
              onPress={calculateTradeInValue}
              disabled={isCalculating}
            >
              <Ionicons 
                name={isCalculating ? "hourglass-outline" : "calculator-outline"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.buttonText}>
                {isCalculating ? "Calculating..." : "Calculate Value"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={resetForm}
            >
              <Ionicons name="refresh-outline" size={20} color="#666" />
              <Text style={[styles.buttonText, styles.resetButtonText]}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Estimated Value Display */}
          {estimatedValue && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.resultTitle}>Estimated Trade-In Value</Text>
              </View>
              <Text style={styles.estimatedValue}>
                ₹{estimatedValue.toLocaleString()}
              </Text>
              <Text style={styles.resultNote}>
                This is an estimated value. Final valuation will be determined after physical inspection.
              </Text>
            </View>
          )}
         </View>
        </ScrollView>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={activeDropdown !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeDropdown}
        >
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
                    <Ionicons name="checkmark" size={20} color="#3498db" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
     </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
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
    borderBottomColor: "#3498db",
    paddingBottom: 5,
  },
  inputGroup: {
    marginBottom: 20,
    zIndex: 1,
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
  dropdownContainer: {
    marginBottom: 5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
    color: "#3498db",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
  },
  calculateButton: {
    backgroundColor: "#3498db",
  },
  resetButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "white",
  },
  resetButtonText: {
    color: "#666",
  },
  resultContainer: {
    marginTop: 30,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  estimatedValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginVertical: 15,
  },
  resultNote: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    fontStyle: "italic",
  },
});
