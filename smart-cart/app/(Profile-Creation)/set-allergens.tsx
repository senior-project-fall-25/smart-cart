import { Text, View,Image, Button, StyleSheet, TouchableOpacity, ScrollView, Modal} from "react-native";
import { Link, useRouter } from "expo-router";
import { HeaderTitle } from "@react-navigation/elements";
import { useState } from "react";
import PopUp from '../../components/popUp'
import Search from "../../components/SearchBar";
import allergenNames from "../../api/allergensNames"
import AddAllergens from "./add-allergens";


export default function SetAllergens() {
    const router = useRouter();
    const [allergens, setAllergens] = useState(['Peanuts', 'Gluten', 'Dairy', 'Pineapple', 'Mango'])
    const [tagged, setTagged] = useState<string[]>([]);
    const [modalVisable, setModalVisable] = useState(false);
    const [addedAllergens,setAddedAllergens] = useState<Array<string>>([]);

    // transform allergens data into string array:


    function closePopUp() {
        setModalVisable(false);
    }

    function acceptPopUp () {

        var newTags = [...tagged, ...addedAllergens.filter((item)=> !tagged.includes(item))];
        
        setTagged(newTags)

        // make the allergens only tagged after add allergens??

        var newAllergens = [...allergens, ...addedAllergens.filter((item) => !allergens.includes(item))];
        setAllergens(newTags);
        setModalVisable(false);

        // clear added allergens
        setAddedAllergens([]);
    }


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
            <Text style={styles.header}>Any Allergies We Should Know?</Text>
             <ScrollView style={styles.scrollBox} contentContainerStyle={styles.row}>
                
                    {
                    allergens.map((item, index) => (
                        allergenTag(item, index)

                    ))
                    }
                    <View style={{width: '100%'}}>
                        <Button onPress={() => {setModalVisable(true)}} title="Add Allergen +"/>
                    </View>
                
            </ScrollView>
            

            <PopUp modalVisable={modalVisable} acceptPopUp={acceptPopUp} closePopUp={closePopUp} buttonText={"Add Allergens"} Content={() => <AddAllergens selected={addedAllergens} setSelected={setAddedAllergens}/>}/>

            <TouchableOpacity
                onPress={()=> router.push({pathname: './finish-profile', params: {'tagged' : JSON.stringify(tagged)}})}
                style={styles.button}
            >
                <Text style={[styles.body, {color: 'white'}]}>Next</Text>
            </TouchableOpacity>
            <Image
                source={require('../../assets/logos/logo2.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            
        </View>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 5,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 5,
        alignContent: 'center',
        height: '50%',
        width: '80%',
    },
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
    scrollBox: {
        height: '40%',
        width: '90%',
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