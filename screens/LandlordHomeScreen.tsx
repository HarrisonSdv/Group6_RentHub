import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function LandlordHomeScreen({ navigation }: any) {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Landlord!</Text>
      <Text style={styles.subtitle}>You're viewing the landlord dashboard.</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Property List" onPress={() => navigation.navigate('PropertyList' , { userType: 'landlord' })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
  },
});
