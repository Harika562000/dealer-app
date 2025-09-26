import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
interface LoanOption {
  bank: string;
  rate: number; 
  tenure: number; 
}

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState<string>("");
  const [selectedLoanIndex, setSelectedLoanIndex] = useState<number>(0);
  const [emi, setEmi] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loanOptions: LoanOption[] = [
    { bank: "HDFC Bank", rate: 7.5, tenure: 12 },
    { bank: "ICICI Bank", rate: 8.0, tenure: 24 },
    { bank: "State Bank of India", rate: 7.0, tenure: 36 },
    { bank: "Axis Bank", rate: 8.5, tenure: 48 },
    { bank: "Kotak Mahindra Bank", rate: 9.0, tenure: 60 },
  ];

  const calculateEmi = (P: number, R: number, N: number) => {
    const monthlyRate = R / 12 / 100;
    if (monthlyRate === 0) return P / N;
    const numerator = P * monthlyRate * Math.pow(1 + monthlyRate, N);
    const denominator = Math.pow(1 + monthlyRate, N) - 1;
    return numerator / denominator;
  };

  const isValidPrincipal = () => {
    const P = parseFloat(principal);
    return !isNaN(P) && P > 0;
  };

  const onCalculate = () => {
    const P = parseFloat(principal);
    if (!isValidPrincipal()) {
      setError("Please enter a valid principal amount.");
      setEmi(null);
      setTotalPayment(null);
      setTotalInterest(null);
      return;
    }

    setError(null);

    const selectedLoan = loanOptions[selectedLoanIndex];
    const { rate, tenure } = selectedLoan;

    const calculatedEmi = calculateEmi(P, rate, tenure);
    const totalPay = calculatedEmi * tenure;
    const interest = totalPay - P;

    setEmi(calculatedEmi);
    setTotalPayment(totalPay);
    setTotalInterest(interest);
  };

  const onReset = () => {
    setPrincipal("");
    setSelectedLoanIndex(0);
    setEmi(null);
    setTotalPayment(null);
    setTotalInterest(null);
    setError(null);
  };

  const selectedLoan = loanOptions[selectedLoanIndex];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>EMI Calculator</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loan Amount (Principal) ₹ *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter principal amount"
            value={principal}
            onChangeText={setPrincipal}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Loan Option *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedLoanIndex}
              onValueChange={(itemValue: number) => setSelectedLoanIndex(itemValue)}
              style={styles.picker}
            >
              {loanOptions.map((loan, idx) => (
                <Picker.Item
                  key={idx}
                  label={`${loan.bank} - ${loan.rate}% for ${loan.tenure} months`}
                  value={idx}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Interest Rate (%)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            editable={false}
            value={selectedLoan.rate.toString()}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tenure (Months)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            editable={false}
            value={selectedLoan.tenure.toString()}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.buttonCalculate, !isValidPrincipal() && styles.buttonDisabled]}
            onPress={onCalculate}
            disabled={!isValidPrincipal()}
          >
            <Text style={styles.buttonText}>Calculate EMI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonReset} onPress={onReset}>
            <Text style={[styles.buttonText, { color: "#555" }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {emi !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>EMI Details</Text>
            <Text style={styles.resultText}>
              Monthly EMI: <Text style={styles.bold}>₹{emi.toFixed(2)}</Text>
            </Text>
            <Text style={styles.resultText}>
              Total Interest Payable:{" "}
              <Text style={styles.bold}>₹{totalInterest?.toFixed(2)}</Text>
            </Text>
            <Text style={styles.resultText}>
              Total Payment (Principal + Interest):{" "}
              <Text style={styles.bold}>₹{totalPayment?.toFixed(2)}</Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f3f5",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#34495e",
    marginBottom: 25,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  disabledInput: {
    backgroundColor: "#ecf0f1",
    color: "#555",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  buttonCalculate: {
    flex: 1,
    backgroundColor: "#171C8F",
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
  },
  buttonReset: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    paddingVertical: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  resultContainer: {
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2ecc71",
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#27ae60",
    marginBottom: 15,
    textAlign: "center",
  },
  resultText: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 8,
    textAlign: "center",
  },
  bold: {
    fontWeight: "700",
    color: "#2c3e50",
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 4,
    fontSize: 14,
  },
});
