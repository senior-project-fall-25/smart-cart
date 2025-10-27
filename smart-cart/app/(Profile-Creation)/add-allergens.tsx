import { Text, View,Image, ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { HeaderTitle } from "@react-navigation/elements";
import Search from "../../components/SearchBar";
import allergenNames from "../../api/allergensNames";
import { useState } from "react";
import AntDesign from '@expo/vector-icons/AntDesign';

interface Props {
    setSelected : (selected : Array<string>) => void;
    selected : Array<string>;
    
}

export default function AddAllergens({selected, setSelected} : Props) {
    const [allergens,setAllergens] = useState<Array<string>>([...selected]);

    console.log(allergens)

    function addAllergen(selected : string){
        var newAllergens: string[] = [...allergens]
        if (!newAllergens.includes(selected)){
            newAllergens.push(selected)
            setSelected(newAllergens);
        }
    }

    function removeAllergen(item : string) {
        var newAllergens: string[] = allergens.filter((element) => element !== item)
        setSelected(newAllergens);
    }

    function allergenTag(item: string, index: any){
    

        return ( 
            <TouchableOpacity  key={index} onPress={()=>{removeAllergen(item)}}style={[styles.tag, styles.selectedTag]}>
                <Text style={styles.body}>{item}</Text>
            </TouchableOpacity>
        );
        
    }
    
    return(
        <View style={styles.container}>
            <Search data={allergenNames} setSelected={addAllergen} selected={""}/>
            <ScrollView style={styles.scrollBox} contentContainerStyle={styles.row}>
                    {
                        allergens.map((item, index) => (
                            allergenTag(item, index)

                        ))
                    }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    body:{
        fontSize: 18,
        fontFamily:'Monserrat',
        textAlign: 'center',
        color: '#303030',
        margin: 10
    },
    scrollBox: {
        alignSelf: 'center',
        height: '55%',
        width: '95%',
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: 'lightgray',
        borderRadius: 20,
        flexDirection:'row',
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
    },
    icon: {
        margin: 2,
    },
    container: {
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        flexDirection: 'column',
    }
   
});