import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TabIconWithBadge = ({ name, color, size, count }: any) => (
  <View style={{ width: size, height: size }}>
    <Ionicons name={name} size={size} color={color} />
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -10,
    top: -5,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default TabIconWithBadge;
