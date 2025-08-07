import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, ScrollView, Dimensions } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FirebaseDB } from "../config/FirebaseConfig";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

type RootStackParamList = {
  PropertyDetailLandlord: { 
    propertyId: string;
    refresh?: number; // Optional refresh timestamp
  };
  EditProperty: { propertyId: string };
};

type PropertyDetailLandlordRouteProp = RouteProp<RootStackParamList, 'PropertyDetailLandlord'>;

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

export default function PropertyDetailLandlord() {
  const navigation = useNavigation<any>();
  const route = useRoute<PropertyDetailLandlordRouteProp>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const auth = getAuth();
  
  const fetchProperty = useCallback(async () => {
    try {
      const propertyId = route.params?.propertyId;
      if (!propertyId) {
        throw new Error('No property ID provided');
      }

      const propertyDoc = await getDoc(doc(FirebaseDB, 'properties', propertyId));
      
      if (!propertyDoc.exists()) {
        throw new Error('Property not found');
      }

      const propertyData = propertyDoc.data() as Omit<Property, 'id'>;
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
      console.error('Error fetching property:', error);
      Alert.alert('Error', 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  }, [route.params?.propertyId, auth.currentUser]);

  // Fetch property data when component mounts or when refresh param changes
  useEffect(() => {
    fetchProperty();
  }, [fetchProperty, route.params?.refresh]);

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
      <Text style={styles.title}>{property.title || 'No Title'}</Text>
      <Text style={styles.subtitle}>{property.description || 'No Description'}</Text>
      <Text style={styles.price}>${property.price?.toLocaleString() || 'N/A'}</Text>
      <Text style={styles.location}>{property.address || 'No Address'}</Text>
      
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
            title={property.title || 'Property Location'}
            description={property.address}
          />
        </MapView>
      </View>

      <View style={styles.addressContainer}>
        <Text style={styles.sectionTitle}>Property Address</Text>
        <View style={styles.addressDetails}>
          <Text style={styles.addressText}>{property.address || 'No Address'}</Text>
          <View style={styles.coordinates}>
            <Text style={styles.coordinateText}>Latitude: {property.latitude?.toFixed(6) || 'N/A'}</Text>
            <Text style={styles.coordinateText}>Longitude: {property.longitude?.toFixed(6) || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {isOwner && (
        <View style={styles.buttonContainer}>
          <Button 
            title={property?.listed === false ? "Re-list Property" : "De-list Property"} 
            onPress={async () => {
              try {
                if (!property) return;
                
                const propertyRef = doc(FirebaseDB, 'properties', property.id);
                await updateDoc(propertyRef, {
                  listed: !property.listed,
                  updatedAt: new Date().toISOString()
                });
                
                // Refresh the property data
                await fetchProperty();
                
                Alert.alert(
                  'Success', 
                  property.listed ? 'Property has been de-listed' : 'Property has been re-listed'
                );
              } catch (error) {
                console.error('Error updating property status:', error);
                Alert.alert('Error', 'Failed to update property status');
              }
            }} 
          />
          <Button 
            title="Edit property" 
            onPress={() => navigation.navigate('EditProperty', { propertyId: property.id })} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addressContainer: {
    marginVertical: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  addressDetails: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  coordinates: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  coordinateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
    width: "100%",
    maxWidth: 200,
  },
});
