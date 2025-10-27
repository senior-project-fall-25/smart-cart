import { Text, View, StyleSheet, TouchableOpacity, Modal} from "react-native";
import { useState, ReactNode, JSX, ReactElement } from "react";
import AntDesign from '@expo/vector-icons/AntDesign';

interface Props {
    modalVisable: boolean;
    closePopUp: () => void;
    Content: () => React.ReactElement;
    buttonText: string;
    acceptPopUp: () => void;
    
}

const PopUp = ({modalVisable, closePopUp, acceptPopUp, Content, buttonText} : Props) => {

    return (
        <Modal 
            animationType="slide" 
            transparent={true} 
            visible={modalVisable}
            onRequestClose={closePopUp}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.icon} onPress={closePopUp}>
                        <AntDesign  name="close" size={24} color="black" />
                    </TouchableOpacity>
                    <Content/>
                    <TouchableOpacity style={styles.button} onPress={acceptPopUp}>
                        <Text style={[styles.body, {color: 'white'}]}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </Modal>
    )
}

export default PopUp;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 5,
        flexDirection:'column',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 5,
        alignItems: 'center',
        height: '50%',
        width: '80%',
    },
    button:{
        backgroundColor: '#5CA3FF',
        color: 'white',
        width: '80%',
        borderRadius: 10,
        position: 'absolute',
        bottom: 40,
        
    },
    body:{
        fontSize: 18,
        fontFamily:'Monserrat',
        textAlign: 'center',
        color: '#303030',
        margin: 10
    },
    icon: {
        margin: 20,
        alignSelf: 'flex-end',
    }
})