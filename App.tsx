import RootNavigation from "./navigation";
import { NavigationContainer } from "@react-navigation/native";

// Dependency for Firebase
// npx expo install firebase
// npm install @react-navigation/native
// npm install @react-navigation/native-stack
// npx expo install react-native-screens react-native-safe-area-context

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigation />
    </NavigationContainer>
  );
}
