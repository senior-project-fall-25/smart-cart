import { Text, View,Image, ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { HeaderTitle } from "@react-navigation/elements";


export default function FinishProfile() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // @ts-expect-error
    const allergens: string[] = params.tagged ? JSON.parse(params.tagged) : []

    const user = {
        name: 'Maddie'
    }

    function allergenTag(item: string, index: any){
        return ( 
            <TouchableOpacity key={index} style={[styles.tag, styles.selectedTag]}>
                <Text style={styles.body}>{item}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container} >
            <Text style={styles.header}>Your SmartCart is Ready, {user.name}!</Text>
            
                <Text style={[styles.body,{textAlign: 'left', fontWeight: '500', width:'80%' }]}>Allergies:</Text>
                <ScrollView style={styles.scrollBox} contentContainerStyle={styles.row}>
                        {
                            allergens.map((item, index) => (
                                allergenTag(item, index)
                            ))
                        }
                </ScrollView>
 
            <TouchableOpacity
                onPress={()=> router.replace('/')}
                style={styles.button}
            >
                <Text style={[styles.body, {color: 'white'}]}>Next</Text>
            </TouchableOpacity>
            <Image
                source={require('@/logos/logo2.png')}
                style={styles.logo}
                resizeMode="contain"
            />
           
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'white',
    },
    logo: {
        height:  '10%',
        margin: 20,
    },
    header: {
        fontSize: 42,
        fontWeight: 'bold',
        fontFamily: 'Monserrat',
        color: '#303030',
        textAlign: 'center',
        margin: 20,
    },
    body:{
        fontSize: 20,
        fontFamily:'Monserrat',
        textAlign: 'center',
        color: '#303030',
        padding: 10
    },
    button:{
        backgroundColor: '#5CA3FF',
        color: 'white',
        width: '80%',
        borderRadius: 10,
    },
    scrollBox: {
        height: '50%',
        width: '80%',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    tag: {
        backgroundColor: 'lightgray',
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedTag: {
        backgroundColor: '#FF5151',
        color: 'white',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        
        flexGrow: 1,
        width: '100%',
    },
   
    
});