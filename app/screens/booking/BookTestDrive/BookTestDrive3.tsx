import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import { DUMMY_DEALERS } from "@/mockDealer";

type RootStackParamList = {
  BookTestDriveStep3: { car: any; userInfo: any; date: string; time: string };
  BookTestDriveStep4: { car: any; userInfo: any; date: string; time: string; dealer: any };
};

type Props = NativeStackScreenProps<RootStackParamList, "BookTestDriveStep3">;

export default function BookTestDriveStep3({ route, navigation }: Props) {
  const { car, userInfo, date, time } = route.params;
  const [selectedDealer, setSelectedDealer] = useState<any>(null);

  const renderDealerCard = ({ item }: { item: typeof DUMMY_DEALERS[0] }) => (
    <TouchableOpacity
      style={[styles.card, selectedDealer?.id === item.id && styles.selected]}
      onPress={() => setSelectedDealer(item)}
    >
      {item.image && <Image source={{ uri: item.image }} style={styles.dealerImage} />}
      <Text style={styles.cardTitle}>{item.dealerName} Dealers</Text>
      <Text style={styles.cardText}>{item.location}</Text>
      <Text style={styles.cardText}>{item.phone}</Text>
      <Text style={styles.cardText}>{item.rating}⭐ </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.activeStep]} />
        <View style={[styles.progressStep, styles.activeStep]} />
        <View style={[styles.progressStep, styles.activeStep]} />
        <View style={styles.progressStep} />
      </View>
      <Text style={styles.stepText}>Step 3 of 4: Select Dealership</Text>
      <Text style={styles.heading}>Select Dealer</Text>

      <FlatList
        data={DUMMY_DEALERS}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2} 
        renderItem={renderDealerCard}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity
        style={[styles.button, !selectedDealer && { backgroundColor: "#ccc" }]}
        disabled={!selectedDealer}
        onPress={() =>
          navigation.navigate("BookTestDriveStep4", { car, userInfo, date, time, dealer: selectedDealer })
        }
      >
        <Text style={styles.buttonText}>Next Step</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: "#fff" },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 20, marginLeft: 8 },
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
  card: { flex: 1, margin: 6, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  selected: { borderColor: "#171C8F", backgroundColor: "#eef" },
  dealerImage: { width: "100%", height: 100, borderRadius: 5, marginBottom: 8, resizeMode: "cover" },
  cardTitle: { fontWeight: "bold", marginBottom: 5,marginLeft:0 },
  cardText: { fontSize: 12, marginBottom: 2 },
  button: { backgroundColor: "#171C8F", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
