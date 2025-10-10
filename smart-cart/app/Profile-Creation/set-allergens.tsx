import { Text, View,Image, Button, StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import { Link, useRouter } from "expo-router";
import { HeaderTitle } from "@react-navigation/elements";
import { useState } from "react";



export default function SetAllergens() {
    const router = useRouter();
    const [allergens, setAllergens] = useState(['Peanuts', 'Gluten', 'Dairy', 'Pineapple', 'Mango'])
    const [tagged, setTagged] = useState<string[]>([]);

    function selectAllergen(allergen: string){
        var newTags: string[] = [...tagged]
        if (tagged.includes(allergen)) {
            newTags = newTags.filter(item => item !== allergen)
        } else {
            newTags.push(allergen)
        }
       
        setTagged(newTags)
    }

    function allergenTag(item: string, index: any){

        var tagStyle = []
        tagStyle.push(styles.tag)

        if (tagged.includes(item)) {
            tagStyle.push(styles.selectedTag)
        }

        return ( 
            <TouchableOpacity onPress={()=> selectAllergen(item)} key={index} style={tagStyle}>
                <Text style={styles.body}>{item}</Text>
            </TouchableOpacity>
        );
        
    }

    return (
        <View style={styles.container} >
            <Text style={styles.header}>Any Allergies We Should Know About?</Text>
             <ScrollView style={styles.scrollBox} contentContainerStyle={styles.row}>
                
                    {
                    allergens.map((item, index) => (
                        allergenTag(item, index)

                    ))
                    }
               
                
            </ScrollView>

            <TouchableOpacity
                onPress={()=> router.push({pathname: './finish-profile', params: {'tagged' : JSON.stringify(tagged)}})}
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
        alignItems: "center",
        backgroundColor: 'white',
    },
    logo: {
        height:  '10%',
        margin: 20,
    },
    header: {
        fontSize: 38,
        fontWeight: 'bold',
        fontFamily: 'Monserrat',
        color: '#303030',
        textAlign: 'center',
        margin: 10,
    },
    body:{
        fontSize: 20,
        fontFamily:'Monserrat',
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
    scrollBox: {
        height: '40%',
        width: '80%',
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    tag: {
        backgroundColor: 'lightgray',
        borderRadius: 20,
        margin: 8,
    },
    selectedTag: {
        backgroundColor: '#FF5151',
        color: 'white',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        width: '100%',
    }
   
});