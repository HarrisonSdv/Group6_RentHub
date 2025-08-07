import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB, firebaseAuth } from '../config/FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const GEOAPIFY_API_KEY = "b09df4b4ee614bf0961ae9037190548b";

type PropertyData = {
  title: string;
  description: string;
  address: string;
  price: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  listed: boolean;
  latitude: number;
  longitude: number;
};

const AddProperty = () => {
  const navigation = useNavigation();
  const [property, setProperty] = useState<PropertyData>({
    title: '',
    description: '',
    address: '',
    price: '',
    createdBy: '',
    createdAt: '',
    updatedAt: '',
    listed: true,
    latitude: 0,
    longitude: 0,
  });
  const [loading, setLoading] = useState(false);


  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const handleInputChange = (field: keyof PropertyData, value: string) => {
    setProperty(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'address') {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      if (value.length > 2) {
        setShowSuggestions(true);
        const timeout = setTimeout(() => {
          getAddressSuggestions(value);
        }, 300); // 300ms debounce delay
        
        setTypingTimeout(timeout);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    }
  };
  
  const getAddressSuggestions = async (input: string) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(input)}&apiKey=${GEOAPIFY_API_KEY}&limit=3`
      );
      const data = await response.json();
      if (data.features) {
        setSuggestions(data.features);
      }
    } catch (error) {
      console.error('Error getting address suggestions:', error);
    }
  };
  
  // Clear any pending API calls when a suggestion is selected
  const handleSelectSuggestion = (suggestion: any) => {
    const { formatted: address, lat, lon } = suggestion.properties;
    
    // Update the input field with the selected address and coordinates
    setProperty(prev => ({
      ...prev,
      address: address,
      latitude: lat,
      longitude: lon
    }));
    
    // Hide suggestions after a small delay to ensure the click is processed
    setTimeout(() => {
      setShowSuggestions(false);
      setSuggestions([]);
    }, 100);
  };
  


  const handleSubmit = async () => {
    // Basic validation
    if (!property.title || !property.address || !property.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const user = firebaseAuth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a property');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(FirebaseDB, 'properties'), {
        ...property,
        price: parseFloat(property.price) || 0,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        listed: true,
      });
      
      Alert.alert('Success', 'Property added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding property:', error);
      Alert.alert('Error', 'Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Property</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={property.title}
          onChangeText={(text) => handleInputChange('title', text)}
          placeholder="Enter property title"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={property.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Enter property description"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address *</Text>
        <View style={styles.addressInputContainer}>
          <TextInput
            style={styles.input}
            value={property.address}
            onChangeText={(text) => handleInputChange('address', text)}
            placeholder="Enter Property Address"
            onBlur={() => {
              // Add a small delay to allow for click events to be processed
              setTimeout(() => {
                setShowSuggestions(false);
              }, 200);
            }}
            onFocus={() => property.address.length > 2 && setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.properties.place_id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>
                    {item.properties.formatted}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Price (CAD) *</Text>
          <TextInput
            style={styles.input}
            value={property.price}
            onChangeText={(text) => handleInputChange('price', text.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Adding...' : 'Add Property'}
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2c3e50',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    zIndex: 10,
  },
  addressInputContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 3,
    zIndex: 1001,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AddProperty;