import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { userAuthentication } from "../config/userAuthentication";
import { firebaseAuth } from '../config/FirebaseConfig';
import { signOut } from 'firebase/auth';

const HomeScreen = () => {

    const { user } = userAuthentication();

    return (
        <View style={styles.container}>
            <Text>Welcome {user?.email}</Text>

            <TouchableOpacity style={styles.buttonStyle} onPress={() => {
                signOut(firebaseAuth)
            }}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
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

export default HomeScreen;