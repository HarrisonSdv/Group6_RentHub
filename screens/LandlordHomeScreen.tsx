import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getAuth } from 'firebase/auth';

export default function LandlordHomeScreen({ navigation }: any) {
  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Landlord!</Text>
      <Text style={styles.subtitle}>You're viewing the landlord dashboard.</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Sign Out" onPress={handleSignOut} />
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
