import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { FirebaseDB, firebaseAuth } from "../config/FirebaseConfig";
import { getAuth } from "firebase/auth";
import MapView, { Marker } from "react-native-maps";

type RootStackParamList = {
	PropertyDetails: {
		propertyId: string;
		refresh?: number; // Optional refresh timestamp
	};
	EditProperty: { propertyId: string };
};
type PropertyDetailsRouteProp = RouteProp<RootStackParamList, "PropertyDetails">;
interface Property {
	id: string;
	title: string;
	description: string;
	address: string;
	price: number;
	createdBy: string;
	latitude: number;
	longitude: number;
	listed: boolean;
	updatedAt?: string;
	createdAt?: string;
}
type Request = {
	propertyId: string | undefined;
	offeredPrice: number;
	accepted: boolean | null; // null=pending true=accepted false=denied
	createdAt: any;
	userId: string | undefined;
};
type Shortlist = {
	userId: string | undefined;
	propertyId: string | undefined;
};

export default function PropertyDetails({}: any) {
	const navigation = useNavigation<any>();
	const route = useRoute<PropertyDetailsRouteProp>();
	const [property, setProperty] = useState<Property | null>(null);
	const [loading, setLoading] = useState(true);
	const [isOwner, setIsOwner] = useState(false);
	const auth = getAuth();

	const fetchProperty = useCallback(async () => {
		try {
			const propertyId = route.params?.propertyId;
			if (!propertyId) {
				throw new Error("No property ID provided");
			}

			const propertyDoc = await getDoc(doc(FirebaseDB, "properties", propertyId));

			if (!propertyDoc.exists()) {
				throw new Error("Property not found");
			}

			const propertyData = propertyDoc.data() as Omit<Property, "id">;
			const currentUser = auth.currentUser;
			const property = { id: propertyDoc.id, ...propertyData };
			setProperty(property);

			// Check if current user is the property owner
			if (currentUser && propertyData.createdBy === currentUser.uid) {
				setIsOwner(true);
			} else {
				setIsOwner(false);
			}
		} catch (error) {
			console.error("Error fetching property:", error);
			Alert.alert("Error", "Failed to load property details");
		} finally {
			setLoading(false);
		}
	}, [route.params?.propertyId, auth.currentUser]);
	// Fetch property data when component mounts or when refresh param changes
	useEffect(() => {
		fetchProperty();
	}, [fetchProperty, route.params?.refresh]);

	const shortlist = useCallback(async () => {
		const user = firebaseAuth.currentUser;
		if (!user) {
			Alert.alert("Error", "No logged in user");
			return;
		}
		const [shortlist, setShortlist] = useState<Shortlist>({
			propertyId: property?.id,
			userId: user?.uid,
		});
		setLoading(true);
		try {
			await addDoc(collection(FirebaseDB, "shortlists"), { ...shortlist });
			Alert.alert("Success", "Shortlisted!", [{ text: "OK", onPress: () => navigation.replace("PropertyDetails", { propertyId: property?.id }) }]);
		} catch (error) {
			console.error("Error shortlisting:", error);
			Alert.alert("Error", "Failed to shortlist property");
		} finally {
			setLoading(false);
		}
	}, [route.params?.propertyId, auth.currentUser]);
	const sendRequest = useCallback(async () => {
		const user = firebaseAuth.currentUser;
		if (!user) {
			Alert.alert("Error", "No logged in user");
			return;
		}

		const [request, setRequest] = useState<Request>({
			propertyId: property?.id,
			offeredPrice: 0,
			accepted: null, // null=pending true=accepted false=denied
			createdAt: serverTimestamp(),
			userId: user?.uid,
		});
		setLoading(true);
		try {
			await addDoc(collection(FirebaseDB, "requests"), { ...request });
			Alert.alert("Success", "Request sent!", [{ text: "OK", onPress: () => navigation.replace("PropertyDetails", { propertyId: property?.id }) }]);
		} catch (error) {
			console.error("Error sending request:", error);
			Alert.alert("Error", "Failed to send request");
		} finally {
			setLoading(false);
		}
	}, [route.params?.propertyId, auth.currentUser]);

	if (loading) {
		return (
			<View style={[styles.container, styles.loadingContainer]}>
				<ActivityIndicator size="large" />
			</View>
		);
	}
	if (!property) {
		return (
			<View style={styles.container}>
				<Text>Property not found</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{property.title || "No Title"}</Text>
			<Text style={styles.subtitle}>{property.description || "No Description"}</Text>
			<Text style={styles.price}>${property.price?.toLocaleString() || "N/A"}</Text>
			<Text style={styles.location}>{property.address || "No Address"}</Text>
			<View style={styles.mapContainer}>
				<MapView
					style={styles.map}
					initialRegion={{
						latitude: property.latitude || 0,
						longitude: property.longitude || 0,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					}}
					scrollEnabled={false}
					zoomEnabled={false}
				>
					<Marker
						coordinate={{
							latitude: property.latitude || 0,
							longitude: property.longitude || 0,
						}}
						title={property.title || "Property Location"}
						description={property.address}
					/>
				</MapView>
			</View>

			<View style={styles.addressContainer}>
				<Text style={styles.sectionTitle}>Property Address</Text>
				<View style={styles.addressDetails}>
					<Text style={styles.addressText}>{property.address || "No Address"}</Text>
					<View style={styles.coordinates}>
						<Text style={styles.coordinateText}>Latitude: {property.latitude?.toFixed(6) || "N/A"}</Text>
						<Text style={styles.coordinateText}>Longitude: {property.longitude?.toFixed(6) || "N/A"}</Text>
					</View>
				</View>
			</View>

			<View style={styles.buttonContainer}>
				<Button
					title="Shortlist"
					onPress={() => {
						shortlist();
					}}
				/>
				<Button
					title="Send Request"
					onPress={() => {
						sendRequest();
					}}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		marginBottom: 30,
	},
	price: {
		fontWeight: "bold",
		fontSize: 16,
	},
	location: {
		fontSize: 14,
	},
	buttonContainer: {
		width: "100%",
		maxWidth: 200,
	},
	mapContainer: {
		height: 200,
		marginBottom: 10,
		marginTop: 15,
		borderRadius: 10,
		overflow: "hidden",
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	addressContainer: {
		marginTop: 0,
		marginBottom: 15,
		backgroundColor: "#f8f8f8",
		borderRadius: 10,
		padding: 15,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 10,
		color: "#333",
	},
	addressDetails: {
		backgroundColor: "white",
		borderRadius: 8,
		padding: 15,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	addressText: {
		fontSize: 16,
		marginBottom: 10,
		color: "#333",
	},
	coordinates: {
		marginTop: 10,
		paddingTop: 10,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
	},
	coordinateText: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	loadingContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
});
