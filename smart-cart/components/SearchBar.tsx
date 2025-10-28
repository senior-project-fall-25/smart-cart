import React,{ useEffect, useState } from "react";
import { View, TextInput, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SearchBar } from "react-native-screens";


interface Props {
    data: Array<string>;
    setSelected: (selected : string) => void; 
    selected: string;
}

const Search = ({data, setSelected, selected}: Props) => {
    // data used to filter autocomplete results an array of string values ex: ['Milk','Peanuts',...]
    // setSelected, selected are use state variables that store the chosen autocomplete value from dropdown

    // so when you chose the value from the dropdown that will show in the text input (if you dont flush it in your parent component)
    const [text, setText] = useState<string>(selected);
    const [filteredData, setFilteredData] = useState<Array<string>>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    console.log(selected)

    const maxItems = 5;
    

    const handleChange = (text: string) => {

        setText(text)

        if(text.trim()){

            var filtered = [];

            const currText = text.toLowerCase().trim();

            console.log(currText);
            
            filtered = data.filter(function(item) {
                return item.toLowerCase().startsWith(currText)
            });

            console.log(filtered);

            if (filtered.length == 0){ // if no results
                filtered.push("No results! Try searching for a synonym of your allergy.")
            } 

            setFilteredData(filtered);

            setShowDropdown(true);

        } else {
            setFilteredData([""]);
            setShowDropdown(false);
        }
    };


    function handleSelect (item: string) {
        setSelected(item);
        
    };


    return (
        <View style={styles.container}>
        <TextInput 
            style={[styles.searchBox, styles.body]} 
            value={text}
            onChangeText={handleChange}
            placeholder="Enter item..."
        />
        {showDropdown && (
            <FlatList
            style={styles.dropdown}
            data={filteredData}
            keyExtractor={(item, index) => item}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)} style={styles.item}>
                    <Text style={styles.body}>{item}</Text>
                </TouchableOpacity>
            )}
            />
        )}
        </View>

    )
}

const styles = StyleSheet.create({
    searchBox: {
        width: '80%', 
        borderColor: 'lightgray',
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'white'
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginTop: 4,
        borderRadius: 8,
        height: 100,
        width: '80%',
        backgroundColor: 'white',
        position: 'absolute',
        top: 45, 
        zIndex: 1000, 
        elevation: 10,
    },
    item: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    body:{
        fontSize: 16,
        fontFamily:'DM-Sans',
        color: '#303030',
    },
    container: {
        width: '100%',
        alignItems: 'center',
    },
})

export default Search