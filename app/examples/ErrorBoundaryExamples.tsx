/**
 * Error Boundary Usage Guide and Examples
 *
 * Error Boundaries are React components that catch JavaScript errors anywhere in their child
 * component tree, log those errors, and display a fallback UI instead of crashing the whole app.
 */

import React from "react";
import { Text, View } from "react-native";
import ErrorBoundary, {
    ComponentErrorBoundary,
    ScreenErrorBoundary,
} from "../components/ErrorBoundary";

// 1. BASIC USAGE - Wrap any component that might throw errors
export const BasicErrorBoundaryExample = () => {
  return (
    <ErrorBoundary>
      <SomeComponentThatMightFail />
    </ErrorBoundary>
  );
};

// 2. SCREEN-LEVEL ERROR BOUNDARY - Use for entire screens
export const ScreenWithErrorBoundary = () => {
  return (
    <ScreenErrorBoundary>
      <MyScreenContent />
    </ScreenErrorBoundary>
  );
};

// 3. COMPONENT-LEVEL ERROR BOUNDARY - Use for specific components
export const ComponentWithErrorBoundary = () => {
  return (
    <ComponentErrorBoundary componentName="CarRecommendations">
      <CarRecommendationsComponent />
    </ComponentErrorBoundary>
  );
};

// 4. CUSTOM ERROR HANDLING - Provide your own error callback
export const CustomErrorHandling = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Send to crash reporting service (e.g., Sentry, Bugsnag)
    console.log("Sending error to crash reporting service:", error);

    // Log additional context
    console.log("Component stack:", errorInfo.componentStack);

    // Could also send to your own analytics service
    // analytics.track('app_error', { error: error.message, stack: error.stack });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <MyApp />
    </ErrorBoundary>
  );
};

// 5. ERROR BOUNDARY WITH RESET KEYS - Auto-reset when certain props change
export const ResetKeyExample = ({ userId }: { userId: string }) => {
  return (
    <ErrorBoundary
      resetKeys={[userId]} // Will reset error boundary when userId changes
      resetOnPropsChange={true} // Reset on any prop change
    >
      <UserProfile userId={userId} />
    </ErrorBoundary>
  );
};

// 6. NESTED ERROR BOUNDARIES - Different boundaries for different error levels
export const NestedErrorBoundaries = () => {
  return (
    <ScreenErrorBoundary>
      <Header />

      <ComponentErrorBoundary componentName="MainContent">
        <MainContent />
      </ComponentErrorBoundary>

      <ComponentErrorBoundary componentName="Sidebar">
        <Sidebar />
      </ComponentErrorBoundary>

      <Footer />
    </ScreenErrorBoundary>
  );
};

// COMMON ERROR PATTERNS AND SOLUTIONS

// Problem: Component throws error due to undefined props
const ProblematicComponent = ({ data }: { data: any }) => {
  return (
    <View>
      {/* This will crash if data.items is undefined */}
      {data.items.map((item: any) => (
        <Text key={item.id}>{item.name}</Text>
      ))}
    </View>
  );
};

// Solution: Wrap with error boundary and add defensive programming
const SafeComponent = ({ data }: { data: any }) => {
  return (
    <ComponentErrorBoundary componentName="DataList">
      <View>
        {data?.items?.map((item: any) => (
          <Text key={item?.id || Math.random()}>{item?.name || "Unknown"}</Text>
        )) || <Text>No data available</Text>}
      </View>
    </ComponentErrorBoundary>
  );
};

// REAL-WORLD EXAMPLES FOR YOUR APP

// 1. Car Detail Screen with Error Boundary
export const SafeCarDetailScreen = ({ car }: { car: any }) => {
  return (
    <ScreenErrorBoundary>
      {/* Your existing CarDetailScreen component */}
      <CarDetailScreen car={car} />
    </ScreenErrorBoundary>
  );
};

// Dummy CarDetailScreen for example purposes
const CarDetailScreen = ({ car }: { car: any }) => (
  <Text>Car Detail: {car?.name || "Unknown Car"}</Text>
);

// 2. Recommendations Section with Error Boundary
export const SafeRecommendationsSection = ({
  recommendations,
}: {
  recommendations: any[];
}) => {
  return (
    <ComponentErrorBoundary componentName="Recommendations">
      {recommendations.map((rec) => (
        <ComponentErrorBoundary key={rec.id} componentName="RecommendationCard">
          <RecommendationCard recommendation={rec} />
        </ComponentErrorBoundary>
      ))}
    </ComponentErrorBoundary>
  );
};

// 3. Image Loading with Error Boundary
export const SafeCarImage = ({ imageUri }: { imageUri: string }) => {
  return (
    <ComponentErrorBoundary componentName="CarImage">
      <CarImage source={{ uri: imageUri }} />
    </ComponentErrorBoundary>
  );
};

// BEST PRACTICES:

// ✅ DO: Use error boundaries at strategic points
// - Around entire screens
// - Around complex components
// - Around third-party components
// - Around data-dependent components

// ✅ DO: Provide meaningful error messages to users
// ✅ DO: Log errors for debugging and crash reporting
// ✅ DO: Allow users to retry or recover from errors
// ✅ DO: Use different error boundaries for different error types

// ❌ DON'T: Wrap every single small component
// ❌ DON'T: Use error boundaries as a substitute for proper error handling
// ❌ DON'T: Ignore the actual causes of errors
// ❌ DON'T: Show technical error details to end users (except in development)

// INTEGRATION WITH YOUR APP STRUCTURE:

/*
App.tsx
├── <ErrorBoundary> (Top-level catch-all)
    ├── Navigation
        ├── <ScreenErrorBoundary> (Per screen)
            ├── CarDetailScreen
                ├── <ComponentErrorBoundary> (Car info)
                ├── <ComponentErrorBoundary> (Recommendations)
                ├── <ComponentErrorBoundary> (Actions)
*/

// Dummy components for examples
const SomeComponentThatMightFail = () => <Text>Component</Text>;
const MyScreenContent = () => <Text>Screen</Text>;
const CarRecommendationsComponent = () => <Text>Recommendations</Text>;
const MyApp = () => <Text>App</Text>;
const UserProfile = ({ userId }: { userId: string }) => (
  <Text>User {userId}</Text>
);
const Header = () => <Text>Header</Text>;
const MainContent = () => <Text>Main</Text>;
const Sidebar = () => <Text>Sidebar</Text>;
const Footer = () => <Text>Footer</Text>;
const RecommendationCard = ({ recommendation }: { recommendation: any }) => (
  <Text>Card</Text>
);
const CarImage = ({ source }: { source: { uri: string } }) => (
  <Text>Image</Text>
);

export default {
  BasicErrorBoundaryExample,
  ScreenWithErrorBoundary,
  CustomErrorHandling,
  SafeCarDetailScreen,
};
