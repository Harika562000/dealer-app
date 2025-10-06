import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";

type RootStackParamList = {
  BookTestDriveStep1: { car: any };
  BookTestDriveStep2: { car: any; userInfo: any};
};

type Props = NativeStackScreenProps<RootStackParamList, "BookTestDriveStep1">;

export default function BookTestDriveStep1({ route, navigation }: Props) {
  const { car } = route.params;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [cityError, setCityError] = useState("");

  // Validation on input change
  const validateFirstName = (text: string) => {
    if (!text) setFirstNameError("First name is required");
    else if (/\d/.test(text)) setFirstNameError("First name cannot contain numbers");
    else if (text.length > 15) setFirstNameError("First name cannot exceed 15 characters");
    else setFirstNameError("");
    setFirstName(text);
  };

  const validateLastName = (text: string) => {
    if (!text) setLastNameError("Last name is required");
    else if (/\d/.test(text)) setLastNameError("Last name cannot contain numbers");
    else setLastNameError("");
    setLastName(text);
  };

  const validateEmail = (text: string) => {
    if (!text) setEmailError("Email is required");
    else setEmailError("");
    setEmail(text);
  };

  const validatePhone = (text: string) => {
    if (!text) setPhoneError("Phone number is required");
    else if (text.length !== 10) 
    setPhoneError("Phone number must be exactly 10 digits");
    else setPhoneError("");
    setPhone(text);
  };

  const validateCity = (text: string) => {
    if (!text) setCityError("City is required");
    else if (/\d/.test(text)) setCityError("City cannot contain numbers");
    else setCityError("");
    setCity(text);
  };

  const isFormValid = () => {
    return (
      firstName && !firstNameError &&
      lastName && !lastNameError &&
      email && !emailError &&
      phone && !phoneError &&
      city && !cityError
    );
  };

  const handleNext = () => {
    const userInfo = {
    name: `${firstName} ${lastName}`, // Combine first and last name
    firstName,
    lastName,
    email,
    phone,
    city,
  };
    navigation.navigate("BookTestDriveStep2", {
      car,
      userInfo,
    });
  };

  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={100}
>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Step Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.activeStep]} />
        <View style={styles.progressStep} />
        <View style={styles.progressStep} />
        <View style={styles.progressStep} />
      </View>
      <Text style={styles.stepText}>Step 1 of 4: Your Details</Text>

      {/* Car Image */}
      <View style={styles.carImageContainer}>
        <Image
          source={typeof car.image === "string" ? { uri: car.image } : car.image}
          style={styles.carImage}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.heading}>Book Test Drive for {car.make} {car.model}</Text>

      <TextInput
        style={[styles.input, firstNameError ? styles.inputError : null]}
        placeholder="First Name"
        value={firstName}
        onChangeText={validateFirstName}
      />
      {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}

      <TextInput
        style={[styles.input, lastNameError ? styles.inputError : null]}
        placeholder="Last Name"
        value={lastName}
        onChangeText={validateLastName}
      />
      {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}

      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="Email"
        value={email}
        onChangeText={validateEmail}
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        style={[styles.input, phoneError ? styles.inputError : null]}
        placeholder="Phone Number"
        value={phone}
        onChangeText={validatePhone}
        keyboardType="phone-pad"
      />
      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

      <TextInput
        style={[styles.input, cityError ? styles.inputError : null]}
        placeholder="City"
        value={city}
        onChangeText={validateCity}
      />
      {cityError ? <Text style={styles.errorText}>{cityError}</Text> : null}

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.button, !isFormValid() && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!isFormValid()}
      >
        <Text style={styles.buttonText}>Next Step</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  progressStep: {
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeStep: { backgroundColor: "#171C8F" },
  stepText: { fontSize: 16, fontWeight: "600", marginTop: 10, marginBottom: 25, textAlign: "center", color: "#333" },
  carImageContainer: { width: "100%", height: 220, borderRadius: 30, marginBottom: 20, overflow: "hidden" },
  carImage: { width: "100%", height: "100%" },
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 25, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 10 },
  inputError: { borderColor: "red" },
  errorText: { color: "red", marginBottom: 10, marginLeft: 5 },
  button: { backgroundColor: "#171C8F", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonDisabled: { backgroundColor: "#999" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
