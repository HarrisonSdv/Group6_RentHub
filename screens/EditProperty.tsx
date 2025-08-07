import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../config/FirebaseConfig';
import { useRoute, useNavigation } from '@react-navigation/native';

type RouteParams = {
  propertyId: string;
};

type RootStackParamList = {
  PropertyDetailLandlord: { 
    propertyId: string;
    refresh?: number;
  };
  EditProperty: { propertyId: string };
};

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params: RootStackParamList[keyof RootStackParamList]) => void;
  goBack: () => void;
};

type PropertyData = {
  id: string;
  title: string;
  description: string;
  address: string;
  price: string;
  createdBy: string;
  latitude: number;
  longitude: number;
};

const EditProperty = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { propertyId } = route.params as RouteParams;
  
  const [property, setProperty] = useState<Omit<PropertyData, 'id'>>({
    title: '',
    description: '',
    address: '',
    price: '',
    createdBy: '',
    latitude: 0,
    longitude: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch property data when component mounts
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const propertyDoc = await getDoc(doc(FirebaseDB, 'properties', propertyId));
        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data() as Omit<PropertyData, 'id'>;
          setProperty(propertyData);
        } else {
          Alert.alert('Error', 'Property not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        Alert.alert('Error', 'Failed to load property details');
        navigation.goBack();
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handleInputChange = (field: keyof typeof property, value: string) => {
    setProperty(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!property.title || !property.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const propertyRef = doc(FirebaseDB, 'properties', propertyId);
      await updateDoc(propertyRef, {
        title: property.title,
        description: property.description,
        price: property.price,
        updatedAt: new Date().toISOString(),
      });
      
      // Pass back the updated property data to refresh the previous screen
      navigation.navigate('PropertyDetailLandlord', { 
        propertyId,
        refresh: Date.now() // Add a timestamp to force refresh
      });
    } catch (error) {
      console.error('Error updating property:', error);
      Alert.alert('Error', 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={property.title}
        onChangeText={(text) => handleInputChange('title', text)}
        placeholder="Enter property title"
        editable={!loading}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={property.description}
        onChangeText={(text) => handleInputChange('description', text)}
        placeholder="Enter property description"
        multiline
        numberOfLines={4}
        editable={!loading}
      />

      <Text style={styles.label}>Price *</Text>
      <TextInput
        style={styles.input}
        value={property.price}
        onChangeText={(text) => handleInputChange('price', text)}
        placeholder="Enter price per month"
        keyboardType="numeric"
        editable={!loading}
      />

      <Text style={styles.label}>Address</Text>
      <Text style={styles.readOnlyText}>{property.address || 'Not specified'}</Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Update Property'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  readOnlyText: {
    fontSize: 16,
    padding: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProperty;
