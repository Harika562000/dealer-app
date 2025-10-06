import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Calendar } from 'react-native-calendars';

type RootStackParamList = {
  BookTestDriveStep2: { car: any; userInfo: any };
  BookTestDriveStep3: { car: any; userInfo: any; date: string; time: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "BookTestDriveStep2">;

export default function BookTestDriveStep2({ route, navigation }: Props) {
  const { car, userInfo } = route.params;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState("");

  const timeSlots = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];

  // Filter time slots if selected date is today
  const availableTimeSlots = timeSlots.filter(slot => {
    if (date !== todayStr) return true;

    const [hourStr, minuteStrWithAM] = slot.split(":");
    const [minuteStr, ampm] = minuteStrWithAM.split(" ");
    let hour = parseInt(hourStr, 10);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    const slotDate = new Date();
    slotDate.setHours(hour, parseInt(minuteStr), 0, 0);

    return slotDate > today;
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.progressContainer}>
              <View style={[styles.progressStep, styles.activeStep]} />
              <View style={[styles.progressStep, styles.activeStep]} />
              <View style={styles.progressStep} />
              <View style={styles.progressStep} />
            </View>
            <Text style={styles.stepText}>Step 2 of 4: Select Date & Time</Text>
      
 <Text style={styles.heading}> Select Date</Text>
      {/* Calendar */}
      <Calendar
        minDate={todayStr}
        onDayPress={day => {
          setDate(day.dateString);
          setTime(""); // reset time if date changes
        }}
        markedDates={{
          [date]: { selected: true, selectedColor: "#171C8F" }
        }}
        style={styles.calendar}
      />

      <Text style={styles.heading}> Select Time</Text>
      <View style={styles.timeContainer}>
        {availableTimeSlots.map(slot => (
          <TouchableOpacity
            key={slot}
            style={[styles.timeSlot, time === slot && styles.timeSelected]}
            onPress={() => setTime(slot)}
          >
            <Text style={time === slot ? { color: "#fff" } : {}}>{slot}</Text>
          </TouchableOpacity>
        ))}
        {availableTimeSlots.length === 0 && (
          <Text style={{ color: "red" }}>No time slots available for today</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, !time && { backgroundColor: "#ccc" }]}
        disabled={!time}
        onPress={() => navigation.navigate("BookTestDriveStep3", { car, userInfo, date, time })}
      >
        <Text style={styles.buttonText}>Next Step</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
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
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 5, textAlign: "left", marginLeft:8 },
  calendar: { marginBottom: 20 },
  timeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginVertical: 10 },
  timeSlot: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, margin: 5 },
  timeSelected: { backgroundColor: "#171C8F", borderColor: "#171C8F" },
  button: { backgroundColor: "#171C8F", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
