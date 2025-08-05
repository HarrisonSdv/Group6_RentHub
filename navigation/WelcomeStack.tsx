import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createNativeStackNavigator();

const WelcomeStack = () => {
    return (
        <Stack.Navigator initialRouteName="SignInScreen">
            <Stack.Screen
                component={SignInScreen}
                name="SignInScreen" />
            <Stack.Screen
                component={SignUpScreen}
                name="SignUpScreen" />
        </Stack.Navigator>
    );
}

export default WelcomeStack;