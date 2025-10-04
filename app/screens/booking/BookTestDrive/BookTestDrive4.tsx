import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, ScrollView } from "react-native";

type RootStackParamList = {
  BookTestDriveStep4: { car: any; userInfo: any; date: string; time: string; dealer: any };
};

type Props = NativeStackScreenProps<RootStackParamList, "BookTestDriveStep4">;

export default function BookTestDriveStep4({ route, navigation }: Props) {
  const { car, userInfo, date, time, dealer } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Step Progress */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.activeStep]} />
        <View style={[styles.progressStep, styles.activeStep]} />
        <View style={[styles.progressStep, styles.activeStep]} />
        <View style={[styles.progressStep, styles.activeStep]} />
      </View>
      <Text style={styles.stepText}>Step 4 of 4: Overview</Text>

      {/* Car Image */}
      <Image
        source={typeof car.image === "string" ? { uri: car.image } : car.image}
        style={styles.carImage}
      />

      {/* Details */}
      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Your Info</Text>
        <Text style={styles.detailText}>Name: {userInfo?.name}</Text>
        <Text style={styles.detailText}>Email: {userInfo?.email}</Text>
        <Text style={styles.detailText}>Phone: {userInfo?.phone}</Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Appointment</Text>
        <Text style={styles.detailText}>Date: {date}</Text>
        <Text style={styles.detailText}>Time: {time}</Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Dealer</Text>
        <Text style={styles.detailText}>{dealer?.dealerName} - {dealer?.location}</Text>
        <Text style={styles.detailText}>Phone: {dealer?.phone}</Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Car</Text>
        <Text style={styles.detailText}>{car.make} {car.model}</Text>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🎉 Test Drive Booked Successfully!</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("CarDetails", { car })}
            >
              <Text style={styles.buttonText}>Back to Car Detail</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#fff" },
  progressContainer: { flexDirection: "row", justifyContent: "center", marginTop: 15, marginBottom: 20 },
  progressStep: { width: 50, height: 6, borderRadius: 3, backgroundColor: "#ccc", marginHorizontal: 5 },
  activeStep: { backgroundColor: "#171C8F" },
  stepText: { fontSize: 16, fontWeight: "600", marginBottom: 20, textAlign: "center", color: "#333" },
  carImage: { width: "100%", height: 220, borderRadius: 12, marginBottom: 20, resizeMode: "cover" },
  detailCard: { padding: 16, borderWidth: 1, borderColor: "#d4ceceff", borderRadius: 12, marginBottom: 15, backgroundColor: "#fff" },
  detailTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  detailText: { fontSize: 15, color: "#070707ff", marginBottom: 4 },
  button: { backgroundColor: "#171C8F", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "80%",height: "27%", alignItems: "center", justifyContent:"center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
});
