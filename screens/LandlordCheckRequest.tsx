import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, query, where, getDocs, getDoc, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { FirebaseDB } from '../config/FirebaseConfig';
import { getAuth } from 'firebase/auth';

type RootStackParamList = {
  LandlordCheckRequest: {
    propertyId: string;
  };
};

type PropertyRequest = {
  id: string;
  propertyId: string;
  userEmail: string;
  offeredPrice: number;
  accepted: boolean | null; // null = pending, true = accepted, false = denied
  createdAt: any;
  userId: string;
  propertyPrice?: number;
};

const LandlordCheckRequest = ({ route, navigation }: any) => {
  const { propertyId } = route.params;
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [propertyPrice, setPropertyPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = getAuth().currentUser;

  const fetchPropertyPrice = async (): Promise<number | null> => {
    try {
      const propertyDoc = await getDoc(doc(FirebaseDB, 'properties', propertyId));
      if (propertyDoc.exists()) {
        const price = propertyDoc.data()?.price;
        return typeof price === 'number' ? price : null;
      }
    } catch (error) {
      console.error('Error fetching property price:', error);
    }
    return null;
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // First, fetch the property price
      const price = await fetchPropertyPrice();
      setPropertyPrice(price);
      
      // Then fetch the requests
      const requestsRef = collection(FirebaseDB, 'PropertyRequest');
      const q = query(
        requestsRef,
        where('propertyId', '==', propertyId),
        where('accepted', '==', null) // Only show pending requests
      );
      
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PropertyRequest[];

      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [propertyId]);

  const handleAccept = async (request: PropertyRequest) => {
    try {
      const batch = writeBatch(FirebaseDB);
      
      // 1. Mark this request as accepted
      const requestRef = doc(FirebaseDB, 'PropertyRequest', request.id);
      batch.update(requestRef, { accepted: true });
      
      // 2. Mark all other requests for this property as denied
      const otherRequestsRef = collection(FirebaseDB, 'PropertyRequest');
      const otherRequestsQ = query(
        otherRequestsRef,
        where('propertyId', '==', propertyId),
        where('accepted', '==', null)
      );
      
      const otherRequestsSnapshot = await getDocs(otherRequestsQ);
      otherRequestsSnapshot.forEach(doc => {
        if (doc.id !== request.id) {
          batch.update(doc.ref, { accepted: false });
        }
      });
      
      // 3. Delist the property
      const propertyRef = doc(FirebaseDB, 'properties', propertyId);
      batch.update(propertyRef, { listed: false });
      
      await batch.commit();
      
      // Refresh the list
      fetchRequests();
      
      Alert.alert('Success', 'Request accepted and property delisted');
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      const requestRef = doc(FirebaseDB, 'PropertyRequest', requestId);
      await updateDoc(requestRef, { accepted: false });
      
      // Remove from local state
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      Alert.alert('Success', 'Request denied');
    } catch (error) {
      console.error('Error denying request:', error);
      Alert.alert('Error', 'Failed to deny request');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Property Requests</Text>
      
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No pending requests found</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.requestCard}>
              <Text style={styles.emailText}>{item.userEmail}</Text>
              <View style={styles.priceContainer}>
                {propertyPrice !== null && (
                  <Text style={styles.listedPriceText}>Listed: ${propertyPrice.toLocaleString()}</Text>
                )}
                <Text style={styles.offeredPriceText}>
                  Offered: ${typeof item.offeredPrice === 'number' ? item.offeredPrice.toLocaleString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.acceptButton]}
                  onPress={() => handleAccept(item)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.denyButton]}
                  onPress={() => handleDeny(item.id)}
                >
                  <Text style={styles.buttonText}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  requestCard: {
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
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceContainer: {
    marginBottom: 12,
  },
  listedPriceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  offeredPriceText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  denyButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});

export default LandlordCheckRequest;