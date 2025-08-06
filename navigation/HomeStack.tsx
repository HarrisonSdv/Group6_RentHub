import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ClientHomeScreen from "../screens/ClientHomeScreen";
import LandlordHomeScreen from "../screens/LandlordHomeScreen";
import PropertyDetails from "../screens/PropertyDetails";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { FirebaseDB } from "../config/FirebaseConfig";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

type RootStackParamList = {
	ClientHome: undefined;
	LandlordHome: undefined;
	PropertyDetails: undefined;
	Loading: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeStack = () => {
	const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>("Loading");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkUserType = async () => {
			setLoading(true);
			const auth = getAuth();
			const user = auth.currentUser;

			if (user) {
				try {
					// First, try to find the user in the Users collection by email
					const usersRef = collection(FirebaseDB, "Users");
					const q = query(usersRef, where("email", "==", user.email));
					const querySnapshot = await getDocs(q);

					if (!querySnapshot.empty) {
						// Get the first matching document (should be only one per email)
						const userData = querySnapshot.docs[0].data();
						setInitialRoute(userData.type === "Landlord" ? "LandlordHome" : "ClientHome");
					} else {
						console.log("No user document found with this email");
						setInitialRoute("ClientHome");
					}
				} catch (error) {
					console.error("Error checking user type:", error);
					setInitialRoute("ClientHome");
				}
			} else {
				// If no user is logged in, default to ClientHome
				setInitialRoute("ClientHome");
			}
			setLoading(false);
		};

		// Set up auth state listener
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, () => {
			checkUserType();
		});

		// Clean up the listener on unmount
		return () => unsubscribe();
	}, []);

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<Stack.Navigator initialRouteName={initialRoute}>
			<Stack.Screen name="ClientHome" component={ClientHomeScreen} options={{ title: "Client Dashboard" }} />
			<Stack.Screen name="LandlordHome" component={LandlordHomeScreen} options={{ title: "Landlord Dashboard" }} />
			<Stack.Screen name="PropertyDetails" component={PropertyDetails} options={{ title: "Property Details" }} />
		</Stack.Navigator>
	);
};

export default HomeStack;
