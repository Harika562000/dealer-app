import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Provider } from "react-redux";
// import TestDriveScreen from "./screens/booking/TestDriveScreen";
import BrowseCarsScreen from "./screens/cars/BrowseCarsScreen";
import CarDetailScreen from "./screens/cars/CarDetailScreen";
import CompareScreen from "./screens/cars/CompareScreen";
// import ProfileScreen from "./screens/profile/ProfileScreen";
import WishlistScreen from "./screens/profile/WishlistScreen";
import { store } from "./store/store";

type RootTabParamList = {
  Cars: undefined;
  Wishlist: undefined;
  TestDrive: undefined;
  Profile: undefined;
};

type RootStackParamList = {
  BrowseCars: undefined;
  CarDetails: { car: any };
  Compare: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function CarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BrowseCars" component={BrowseCarsScreen} options={{ title: "Browse Cars" }} />
      <Stack.Screen name="CarDetails" component={CarDetailScreen} options={{ title: "Car Details" }} />
      <Stack.Screen name="Compare" component={CompareScreen} options={{ title: "Compare Cars" }} />
    </Stack.Navigator>
  );
}

function WishlistWrapper({ navigation, route }: any) {
  return <WishlistScreen navigation={navigation} route={route} />;
}

export default function App() {
  return (
    <Provider store={store}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "car";
            if (route.name === "Cars") iconName = "car-sport";
            else if (route.name === "Wishlist") iconName = "heart";
            else if (route.name === "TestDrive") iconName = "calendar";
            else if (route.name === "Profile") iconName = "person";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Cars" component={CarStack} options={{ headerShown: false }} />
        <Tab.Screen name="Wishlist" component={WishlistWrapper} />
        {/* <Tab.Screen name="TestDrive" component={TestDriveScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} /> */}
      </Tab.Navigator>
    </Provider>
  );
}
