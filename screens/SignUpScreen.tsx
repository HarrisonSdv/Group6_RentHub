import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, getDocs, query, where } from "firebase/firestore";
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { firebaseAuth, FirebaseDB } from '../config/FirebaseConfig';

const SignUpScreen: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {

    const [userObject, setUserObject] = useState({
        email: '',
        password: '',
        error: ''
    });

    async function onSignUpClient() {
        if (userObject.email === "" || userObject.password === "") {
            setUserObject({ ...userObject, error: "Email and Password is mandatory!" });
            return;
        }

        try {
            const clientRef = collection(FirebaseDB, "Users");
            const q = query(clientRef, where("email", "==", userObject.email), where("type", "==", "Client"));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                setUserObject({ ...userObject, error: "A client with this email already exists." });
                return;
            }
            
            await createUserWithEmailAndPassword(firebaseAuth, userObject.email, userObject.password)
                .then(async (result) => {
                    await addDoc(clientRef, {
                        email: userObject.email,
                        password: userObject.password,
                        id: result.user.uid,
                        type: "Client"
                    });
                    navigation.navigate('ClientHome');
                })
        } catch (err) {
            console.log(err);
            setUserObject({ ...userObject, error: `${err.message}` });
        }
    }

    async function onSignUpLandlord() {
        if (userObject.email === "" || userObject.password === "") {
            setUserObject({ ...userObject, error: "Email and Password is mandatory!" });
            return;
        }

        try {
            const landlordsRef = collection(FirebaseDB, "Users");
            const q = query(landlordsRef, where("email", "==", userObject.email), where("type", "==", "Landlord"));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                setUserObject({ ...userObject, error: "A landlord with this email already exists." });
                return;
            }

            // If email doesn't exist, proceed with account creation
            await createUserWithEmailAndPassword(firebaseAuth, userObject.email, userObject.password)
                .then(async (result) => {
                    await addDoc(landlordsRef, {
                        email: userObject.email,
                        password: userObject.password, 
                        id: result.user.uid,
                        type: "Landlord"
                    });
                    navigation.navigate('LandlordHome');
                });
        } catch (err) {
            console.log(err);
            setUserObject({ ...userObject, error: `${err.message}` });
        }
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.inputStyle}
                value={userObject.email}
                onChangeText={(text) => setUserObject({ ...userObject, email: text })}
                placeholder='Enter email (e.g: name@gmail.com)'
                placeholderTextColor="#8395a7"
                keyboardType='email-address'
                autoCorrect={false}
                autoCapitalize='none' />

            <TextInput
                style={styles.inputStyle}
                value={userObject.password}
                onChangeText={(text) => setUserObject({ ...userObject, password: text })}
                placeholder='Enter password'
                placeholderTextColor="#8395a7"
                secureTextEntry={true}
                keyboardType='default'
                maxLength={12}
                autoCorrect={false}
                autoCapitalize='none' />

            {
                !!userObject.error &&
                <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 16, color: 'red' }}>{userObject.error}</Text>
                </View>
            }

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonStyle} onPress={onSignUpClient}>
                    <Text style={styles.buttonText}>Client Sign Up</Text>
                </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={onSignUpLandlord}>
                    <Text style={styles.buttonText}>Landlord Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 10
    },
    inputStyle: {
        fontSize: 20,
        borderColor: '#1dd1a1',
        borderWidth: 2,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 50,
        marginVertical: 5,
        width: '90%'
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        gap: 15,
    },
    buttonStyle: {
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        width: "45%",
        height: 45,
        borderRadius: 5,
        backgroundColor: "#10ac84",
    },
    buttonText: {
        fontSize: 20,
        color: "white",
        fontWeight: "700",
    },
});

export default SignUpScreen;