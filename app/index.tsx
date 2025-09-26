import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Provider } from "react-redux";
// import TestDriveScreen from "./screens/booking/TestDriveScreen";
import NotificationBadge from "./components/NotificationBadge";
import BrowseCarsScreen from "./screens/cars/BrowseCarsScreen";
import CarDetailScreen from "./screens/cars/CarDetailScreen";
import CompareScreen from "./screens/cars/CompareScreen";
import TradeInEstimationScreen from "./screens/cars/TradeInEstimationScreen";
// import ProfileScreen from "./screens/profile/ProfileScreen";
import EmiCalculator from "./screens/cars/EmiCalculator";
import FinancePreApprovalForm from "./screens/cars/FinancePreApprovalForm";
import NotificationsScreen from "./screens/profile/NotificationsScreen";
import WishlistScreen from "./screens/profile/WishlistScreen";
import RecommendationsScreen from "./screens/recommendations/RecommendationsScreen";
import { store } from "./store/store";

type RootTabParamList = {
  Cars: undefined;
  Recommendations: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Compare: undefined;
  Profile: undefined;
};

type RootStackParamList = {
  BrowseCars: undefined;
  CarDetails: { car: any };
  Compare: undefined;
  TradeInEstimation: undefined;
  EmiCalculator: undefined;
  FinancePreApprovalForm: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function CarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BrowseCars"
        component={BrowseCarsScreen}
        options={{ title: "Browse Cars" }}
      />
      <Stack.Screen
        name="CarDetails"
        component={CarDetailScreen}
        options={{ title: "Car Details" }}
      />
      <Stack.Screen
        name="TradeInEstimation"
        component={TradeInEstimationScreen}
        options={{ title: "Trade-In Estimation" }}
      />
      <Stack.Screen
        name="EmiCalculator"
        component={EmiCalculator}
        options={{ title: "EMI Calculator" }}
      />
      <Stack.Screen
        name="FinancePreApprovalForm"
        component={FinancePreApprovalForm}
        options={{ title: "Finance Pre-Approval" }}
      />
    </Stack.Navigator>
  );
}

function RecommendationsWrapper({ navigation }: any) {
  return <RecommendationsScreen navigation={navigation} />;
}

function WishlistWrapper({ navigation, route }: any) {
  return <WishlistScreen navigation={navigation} route={route} />;
}

function NotificationsWrapper({ navigation, route }: any) {
  return <NotificationsScreen navigation={navigation} route={route} />;
}

export default function App() {
  return (
    <Provider store={store}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === "Notifications") {
              return <NotificationBadge color={color} size={size} />;
            }

            let iconName: keyof typeof Ionicons.glyphMap = "car";
            if (route.name === "Cars") iconName = "car-sport";
            else if (route.name === "Recommendations") iconName = "star";
            else if (route.name === "Wishlist") iconName = "heart";
            else if (route.name === "Compare") iconName = "git-compare";
            else if (route.name === "Profile") iconName = "person";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Cars"
          component={CarStack}
          options={{ headerShown: false }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault(); // stop default behavior
              navigation.navigate("BrowseCars"); // always go to BrowseCars
            },
          })}
        />
        <Tab.Screen name="Recommendations" component={RecommendationsWrapper} />
        <Tab.Screen name="Wishlist" component={WishlistWrapper} />
        <Tab.Screen name="Compare" component={CompareScreen} />
        <Tab.Screen name="Notifications" component={NotificationsWrapper} />
        {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
      </Tab.Navigator>
    </Provider>
  );
}
