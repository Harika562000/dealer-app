import React, { useState } from 'react';
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
} from 'react-native';

export default function FinancePreApprovalForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    income: '',
    loanAmount: '',
    tenureMonths: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' })); // Clear error on input
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        errors[key] = 'This field is required';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Your pre-approval request has been submitted!');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        income: '',
        loanAmount: '',
        tenureMonths: '',
      });
      setFormErrors({});
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Finance Pre-Approval</Text>
        <Text style={styles.subtitle}>
          Fill in your financial details to check pre-approval eligibility
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, formErrors.fullName && styles.inputError]}
            value={formData.fullName}
            onChangeText={(text) => updateField('fullName', text)}
            placeholder="Full Name"
          />
          {formErrors.fullName && <Text style={styles.errorText}>{formErrors.fullName}</Text>}
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, formErrors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={[styles.input, formErrors.phone && styles.inputError]}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder="+91XXXXXXXXXX"
            keyboardType="phone-pad"
          />
          {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}
        </View>

        {/* Income */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monthly Income (₹) *</Text>
          <TextInput
            style={[styles.input, formErrors.income && styles.inputError]}
            value={formData.income}
            onChangeText={(text) => updateField('income', text)}
            placeholder="50000"
            keyboardType="numeric"
          />
          {formErrors.income && <Text style={styles.errorText}>{formErrors.income}</Text>}
        </View>

        {/* Loan Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loan Amount (₹) *</Text>
          <TextInput
            style={[styles.input, formErrors.loanAmount && styles.inputError]}
            value={formData.loanAmount}
            onChangeText={(text) => updateField('loanAmount', text)}
            placeholder="200000"
            keyboardType="numeric"
          />
          {formErrors.loanAmount && <Text style={styles.errorText}>{formErrors.loanAmount}</Text>}
        </View>

        {/* Tenure */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loan Tenure (Months) *</Text>
          <TextInput
            style={[styles.input, formErrors.tenureMonths && styles.inputError]}
            value={formData.tenureMonths}
            onChangeText={(text) => updateField('tenureMonths', text)}
            placeholder="24"
            keyboardType="numeric"
          />
          {formErrors.tenureMonths && (
            <Text style={styles.errorText}>{formErrors.tenureMonths}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={onSubmit}
          disabled={isSubmitting}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Submitting...' : 'Apply for Pre-Approval'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f5',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#171C8F',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 4,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#171C8F',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
