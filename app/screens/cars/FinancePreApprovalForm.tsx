import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const { fullName, email, phone, income, loanAmount, tenureMonths } = formData;
    if (!fullName.trim() || !email.trim() || !phone.trim() || !income.trim() || !loanAmount.trim() || !tenureMonths.trim()) {
      Alert.alert('Validation Error', 'Please fill all fields.');
      return false;
    }
    return true;
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
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Finance Pre-Approval
        </Text>

        <Text style={{ marginBottom: 5 }}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={(text) => updateField('fullName', text)}
          placeholder="Full Name"
        />

        <Text style={{ marginBottom: 5 }}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={{ marginBottom: 5 }}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          placeholder="+1234567890"
          keyboardType="phone-pad"
        />

        <Text style={{ marginBottom: 5 }}>Monthly Income (₹) *</Text>
        <TextInput
          style={styles.input}
          value={formData.income}
          onChangeText={(text) => updateField('income', text)}
          placeholder="50000"
          keyboardType="numeric"
        />

        <Text style={{ marginBottom: 5 }}>Loan Amount (₹) *</Text>
        <TextInput
          style={styles.input}
          value={formData.loanAmount}
          onChangeText={(text) => updateField('loanAmount', text)}
          placeholder="200000"
          keyboardType="numeric"
        />

        <Text style={{ marginBottom: 5 }}>Loan Tenure (Months) *</Text>
        <TextInput
          style={styles.input}
          value={formData.tenureMonths}
          onChangeText={(text) => updateField('tenureMonths', text)}
          placeholder="24"
          keyboardType="numeric"
        />

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isSubmitting}
          style={{
            marginTop: 30,
            backgroundColor: isSubmitting ? '#999' : '#3498db',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {isSubmitting ? 'Submitting...' : 'Apply for Pre-Approval'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    fontSize: 16,
  },
};
