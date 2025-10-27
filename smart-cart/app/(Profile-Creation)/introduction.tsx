import { Text, View,Image, Button, StyleSheet, TouchableOpacity} from "react-native";
import { Link, useRouter } from "expo-router";
import { HeaderTitle } from "@react-navigation/elements";


export default function Introduction() {
    const router = useRouter();
    return (
        <View style={styles.container} >
            <Text style={styles.header}>Set Your Preferences</Text>
            <Text style={styles.body}>Tell us about your diet so we can personalize your shopping.</Text>
            <Image
                source={require('../../assets/logos/logo2.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <TouchableOpacity
                onPress={()=> router.push('./set-allergens')}
                style={styles.button}
            >
                <Text style={[styles.body, {color: 'white'}]}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'white',
    },
    logo: {
        height:  '25%',
        margin: '10%',
    },
    header: {
        fontSize: 48,
        fontWeight: 'bold',
        fontFamily: 'DM-Sans-SemiBold',
        color: '#303030',
        textAlign: 'center',
        margin: 10,
    },
    body:{
        fontSize: 20,
        fontFamily:'DM-Sans',
        textAlign: 'center',
        color: '#303030',
        margin: 10
    },
    button:{
        backgroundColor: '#5CA3FF',
        color: 'white',
        width: '80%',
        borderRadius: 10,
    },
    
});