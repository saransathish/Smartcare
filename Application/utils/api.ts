import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8000';

export const setAuthToken = async (token: string) => {
    try {
        await AsyncStorage.setItem('token', token);
    } catch (error) {
        console.error('Error saving auth token:', error);
    }
};

export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem('token');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/login/`, {
            username,
            password,
        });
        if (response.data.token) {
            await setAuthToken(response.data.token);
        }
        return response.data;
    } catch (error) {
        throw new Error('Login failed');
    }
};

export const register = async (
    username: string,
    email: string,
    password: string,
    phone_number: string
) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/register/`, {
            username,
            email,
            password,
            phone_number,
        });
        return response.data;
    } catch (error) {
        throw new Error('Registration failed');
    }
};

export const getUserDetails = async () => {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error('No auth token');

        const response = await axios.get(`${API_URL}/api/auth/user/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to get user details');
    }
};