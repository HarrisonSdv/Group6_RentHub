import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ClientHomeScreen from "../screens/ClientHomeScreen";
import LandlordHomeScreen from "../screens/LandlordHomeScreen";
import PropertyDetails from "../screens/PropertyDetails";
import PropertyList from "../screens/PropertyList";
import PropertyDetailLandlord from "../screens/PropertyDetailLandlord";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { FirebaseDB } from "../config/FirebaseConfig";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, TouchableOpacity, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import AddProperty from "../screens/AddProperty";
import EditProperty from "../screens/EditProperty";
import LandlordCheckRequest from "../screens/LandlordCheckRequest";

type RootStackParamList = {
  ClientHome: undefined;
  LandlordHome: undefined;
  PropertyDetails: { propertyId: string };
  PropertyDetailLandlord: { propertyId: string };
  PropertyList: { userType: 'landlord' | 'client' };
  Loading: undefined;
  AddProperty: undefined;
  EditProperty: { propertyId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Sign out function component
const SignOutButton = () => {
  const navigation = useNavigation<any>();

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <TouchableOpacity 
      onPress={handleSignOut}
      style={{
        marginRight: 15,
        padding: 5,
        backgroundColor: '#ff4444',
        borderRadius: 5,
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Sign Out</Text>
    </TouchableOpacity>
  );
};

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
		<Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerRight: () => <SignOutButton /> }}>
			<Stack.Screen name="ClientHome" component={ClientHomeScreen} options={{ title: "Client Dashboard" }} />
			<Stack.Screen name="LandlordHome" component={LandlordHomeScreen} options={{ title: "Landlord Dashboard" }} />
        <Stack.Screen name="AddProperty" component={AddProperty} options={{ title: "Add Property" }} />
        <Stack.Screen name="PropertyDetails" component={PropertyDetails} options={{ title: "Property Details" }} />
        <Stack.Screen name="PropertyDetailLandlord" component={PropertyDetailLandlord} options={{ title: "Property Details" }} />
        <Stack.Screen name="PropertyList" component={PropertyList} options={{ title: "Properties" }} />
        <Stack.Screen name="EditProperty" component={EditProperty} options={{ title: "Edit Property" }} />
        <Stack.Screen name="LandlordCheckRequest" component={LandlordCheckRequest} options={{ title: "Check Request" }} />
		</Stack.Navigator>
	);
};

export default HomeStack;
