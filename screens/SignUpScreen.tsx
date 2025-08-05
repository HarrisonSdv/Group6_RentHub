import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { firebaseAuth } from '../config/FirebaseConfig';

const SignUpScreen: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {

    const [userObject, setUserObject] = useState({
        email: '',
        password: '',
        error: ''
    });

    async function onSignUp() {
        if (userObject.email === "" || userObject.password === "") {
            setUserObject({ ...userObject, error: "Email and Password is mandatory!" });
            return;
        }

        try {
            await createUserWithEmailAndPassword(firebaseAuth, userObject.email, userObject.password)
                .then((result) => {
                    Alert.alert("User Created Successfully!", `Welcome ${result.user.email}`)
                })
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

            <TouchableOpacity style={styles.buttonStyle} onPress={onSignUp}>
                <Text style={styles.buttonText}>SignUp</Text>
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
    buttonStyle: {
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        width: "75%",
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