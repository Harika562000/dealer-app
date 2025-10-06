import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Provider, useSelector } from "react-redux";

import NotificationBadge from "./components/NotificationBadge";
import ProfileScreen from "./screens/auth/ProfileScreen";
import BookTestDriveStep1 from "./screens/booking/BookTestDrive/BookTestDrive1";
import BookTestDriveStep2 from "./screens/booking/BookTestDrive/BookTestDrive2";
import BookTestDriveStep3 from "./screens/booking/BookTestDrive/BookTestDrive3";
import BookTestDriveStep4 from "./screens/booking/BookTestDrive/BookTestDrive4";
import BrowseCarsScreen from "./screens/cars/BrowseCarsScreen";
import CarDetailScreen from "./screens/cars/CarDetailScreen";
import CompareScreen from "./screens/cars/CompareScreen";
import EmiCalculator from "./screens/cars/EmiCalculator";
import FinancePreApprovalForm from "./screens/cars/FinancePreApprovalForm";
import TabIconWithBadge from "./screens/cars/tabIconWithBadge";
import TradeInEstimationScreen from "./screens/cars/TradeInEstimationScreen";
import ChatScreen from "./screens/chat/ChatScreen";
import NotificationsScreen from "./screens/profile/NotificationsScreen";
import WishlistScreen from "./screens/profile/WishlistScreen";
import RecommendationsScreen from "./screens/recommendations/RecommendationsScreen";
import { store } from "./store/store";

// Type definitions for navigation
type RootTabParamList = {
  Cars: undefined;
  Recommendations: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Compare: undefined;
  Service: undefined;
  Profile: undefined;
};

type RootStackParamList = {
  BrowseCars: undefined;
  CarDetails: { car: any };
  Compare: undefined;
  TradeInEstimation: undefined;
  EmiCalculator: undefined;
  FinancePreApprovalForm: undefined;
  BookTestDriveStep1: { car: any };
  BookTestDriveStep2: { car: any; userInfo: { name: string; email: string; phone: string } };
  BookTestDriveStep3: { car: any; userInfo: { name: string; email: string; phone: string }; date: string; time: string };
  BookTestDriveStep4: { car: any; userInfo: { name: string; email: string; phone: string }; date: string; time: string; dealer: any };
  Profile: undefined;
  ChatScreen: undefined;
};
 
const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Animated header component
function AnimatedHeaderTitle() {
  const translateX = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 4,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: "#171C8F" }}>
        AutoBuddy
      </Text>
      <Animated.Image
        source={require("../assets/images/car.png")}
        style={{
          width: 64,
          height: 64,
          marginRight: 6,
          transform: [{ translateX }],
        }}
      />
      
    </View>
  );
}

// Car stack navigator
function CarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BrowseCars"
        component={BrowseCarsScreen}
        options={({ navigation }) => ({
          headerTitle: () => <AnimatedHeaderTitle />,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="person-circle-outline" size={33} color="#171C8F" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="CarDetails" component={CarDetailScreen} options={{ title: "Car Details" }} />
      <Stack.Screen name="TradeInEstimation" component={TradeInEstimationScreen} options={{ title: "Trade-In Estimation" }} />
      <Stack.Screen name="EmiCalculator" component={EmiCalculator} options={{ title: "EMI Calculator" }} />
      <Stack.Screen name="FinancePreApprovalForm" component={FinancePreApprovalForm} options={{ title: "Finance Pre-Approval" }} />
      <Stack.Screen name="BookTestDriveStep1" component={BookTestDriveStep1} options={{ title: "Book Test Drive" }} />
      <Stack.Screen name="BookTestDriveStep2" component={BookTestDriveStep2} options={{ title: "Book Test Drive" }} />
      <Stack.Screen name="BookTestDriveStep3" component={BookTestDriveStep3} options={{ title: "Book Test Drive" }} />
      <Stack.Screen name="BookTestDriveStep4" component={BookTestDriveStep4} options={{ title: "Book Test Drive" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: "Ask Car Assistant" }} />
    </Stack.Navigator>
  );
}

// Wrappers for screens that need navigation/route props
function RecommendationsWrapper({ navigation }: any) {
  return <RecommendationsScreen navigation={navigation} />;
}

function WishlistWrapper({ navigation, route }: any) {
  return <WishlistScreen navigation={navigation} route={route} />;
}

function NotificationsWrapper({ navigation, route }: any) {
  return <NotificationsScreen navigation={navigation} route={route} />;
}

// Root tab navigator
function RootNavigator() {
  const compareCount = useSelector((state: any) => state.cars.compareList.length);
  const wishlistCount = useSelector((state: any) => state.cars.wishlist.length);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Notifications") {
            return <NotificationBadge color={color} size={size} />;
          }

          let iconName: keyof typeof Ionicons.glyphMap = "car";
          let count = 0;

          if (route.name === "Cars") iconName = "car-sport";
          else if (route.name === "Recommendations") iconName = "star";
          else if (route.name === "Wishlist") {
            iconName = "heart";
            count = wishlistCount;
          } else if (route.name === "Compare") {
            iconName = "git-compare";
            count = compareCount;
          } else if (route.name === "Service") iconName = "construct";
          else if (route.name === "Profile") iconName = "person";

          return <TabIconWithBadge name={iconName} size={size} color={color} count={count} />;
        },
      })}
    >
      <Tab.Screen
        name="Cars"
        component={CarStack}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("BrowseCars");
          },
        })}
      />
      <Tab.Screen name="Recommendations" component={RecommendationsWrapper} />
      <Tab.Screen name="Wishlist" component={WishlistWrapper} />
      <Tab.Screen name="Compare" component={CompareScreen} />
      <Tab.Screen name="Service" component={ServiceWrapper} />
      <Tab.Screen name="Notifications" component={NotificationsWrapper} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootNavigator />
      </PersistGate>
    </Provider>
  );
}

