import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { User } from '../types/types';
import { getUserDetails } from '../utils/api';

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDetails = await getUserDetails();
        setUser(userDetails);
      } catch (err) {
        console.error('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.homeBox}>
        <Text style={styles.title}>Welcome to SmartCare</Text>
        {user ? (
          <View style={styles.userDetails}>
            <Text style={styles.detailText}>Username: {user.username}</Text>
            <Text style={styles.detailText}>Email: {user.email}</Text>
            <Text style={styles.detailText}>Phone: {user.phone_number}</Text>
          </View>
        ) : (
          <Text style={styles.errorText}>Failed to load user details</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  homeBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  userDetails: {
    marginTop: 20,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Home;