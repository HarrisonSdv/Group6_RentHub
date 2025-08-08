import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FirebaseDB } from '../config/FirebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

type RootStackParamList = {
  PropertyList: { userType: 'landlord' | 'client' };
  PropertyDetails: { propertyId: string };
  PropertyDetailLandlord: { propertyId: string };
  AddProperty: undefined;
};

type PropertyListProps = {
  route: {
    params: {
      userType: 'landlord' | 'client';
      userOnly: boolean;
    };
  };
  navigation: any;
};

type Property = {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  createdBy: string;
  listed: boolean;
};

const PropertyList = ({ route, navigation }: PropertyListProps) => {
  const { userType, userOnly = false } = route.params;
  const [propertyList, setPropertyList] = useState<Property[]>([]);
  const [filteredList, setFilteredList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const db = FirebaseDB;
  const currentUser = getAuth().currentUser;

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const propertiesRef = collection(db, 'properties');
      const propertyDocs = await getDocs(propertiesRef);
      
      const properties = propertyDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Property[];
      
      setPropertyList(properties);
      
      // Filter properties: show all to owner, only listed to others
      if (userType === 'landlord' && userOnly) {
        const filtered = properties.filter(property => 
          (property.createdBy === currentUser?.uid)
        );
        setFilteredList(filtered);
      } else {
        const filtered = properties.filter(property => 
          property.listed !== false || (userType === 'landlord' && property.createdBy === currentUser?.uid)
        );
        setFilteredList(filtered);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [currentUser?.uid])
  );

  const PropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity 
      style={[
        styles.propertyItem,
        !item.listed && styles.hiddenProperty
      ]}
      onPress={() => {
        if (userType === 'landlord') {
          navigation.navigate('PropertyDetailLandlord', { propertyId: item.id });
        } else {
          navigation.navigate('PropertyDetails', { propertyId: item.id });
        }
      }}
    >
      <View style={styles.propertyHeader}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        {!item.listed && (
          <View style={styles.hiddenBadge}>
            <Text style={styles.hiddenBadgeText}>Hidden</Text>
          </View>
        )}
      </View>
      <Text style={styles.propertyPrice}>${item.price.toLocaleString()}/month</Text>
      <Text style={styles.propertyAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userType === 'landlord' && (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('AddProperty')}
        >
          <Text style={styles.addButtonText}>Add Property</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>Property List</Text>
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyItem item={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No properties found
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  propertyItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hiddenProperty: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  propertyPrice: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
  },
  hiddenBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  hiddenBadgeText: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});

export default PropertyList;