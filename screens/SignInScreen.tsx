import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { firebaseAuth, FirebaseDB } from '../config/FirebaseConfig';

const SignInScreen: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {

    const [userObject, setUserObject] = useState({
        email: '',
        password: '',
        error: ''
    });

    async function onSignInClient() {
        if (userObject.email === "" || userObject.password === "") {
            setUserObject({ ...userObject, error: "Email and Password is mandatory!" });
            return;
        }

        try {
            const usersRef = collection(FirebaseDB, "Users");
            const q = query(usersRef, where("email", "==", userObject.email), where("type", "==", "Client"));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                setUserObject({ ...userObject, error: "No client found with this email." });
                return;
            }
        
            await signInWithEmailAndPassword(firebaseAuth, userObject.email, userObject.password)
        } catch (err) {
            console.log(err);
            setUserObject({ ...userObject, error: `${err.message}` });
        }
    }

    async function onSignInLandlord() {
        if (userObject.email === "" || userObject.password === "") {
            setUserObject({ ...userObject, error: "Email and Password is mandatory!" });
            return;
        }

        try {
            const usersRef = collection(FirebaseDB, "Users");
            const q = query(usersRef, where("email", "==", userObject.email), where("type", "==", "Landlord"));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                setUserObject({ ...userObject, error: "No landlord found with this email." });
                return;
            }
        
            await signInWithEmailAndPassword(firebaseAuth, userObject.email, userObject.password)
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
                <TouchableOpacity style={styles.buttonStyle} onPress={onSignInClient}>
                    <Text style={styles.buttonText}>Client Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonStyle} onPress={onSignInLandlord}>
                    <Text style={styles.buttonText}>Landlord Sign In</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.buttonStyle, { marginTop: 'auto', marginBottom: 50 }]}
                onPress={() => { navigation.navigate("SignUpScreen") }} >
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
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

export default SignInScreen;