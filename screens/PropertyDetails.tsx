import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function PropertyDetails({ navigation }: any) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Property Name</Text>
			<Text style={styles.subtitle}>Property Description</Text>
			<Text style={styles.price}>$555</Text>
			<Text style={styles.location}>Location</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
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
});
