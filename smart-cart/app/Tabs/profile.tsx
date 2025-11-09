import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { auth,db } from "@/src/FirebaseConfig";
import { addDoc, getDoc, collection, doc, updateDoc } from 'firebase/firestore';
import {changeAllergens, getUser } from '../Database/requests'
import AddAllergens from "../Profile-Creation/add-allergens";
import PopUp from "@/components/popUp";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<Boolean>(false);
  const [modalVisable, setModalVisable] = useState(false);
  const [allergies,setAllergies] = useState<Array<string>>([]);
  const router = useRouter();
  const [data, setData] = useState({});

  function closePopUp() {
    //discard changes -> no action
    setModalVisable(false);
  }

  function acceptPopUp () {

    // if no change -> no push to database
    var change = false;

    if (user.allergies.length != allergies.length){
      // some allergies deleted or added
      change = true;
    } else {
      // added + deleted but might be the same
      for (var i = 0; i < allergies.length; i++) {
        if (!user.allergies.includes(allergies[i])){
          change = true;
          break;
        }
      }
    }

    if (change){
      // push allergies to database -> should trigger rerender and get the new user
      changeAllergens(allergies);
    }

    const newUser = {...user};
    newUser.allergies = allergies;
    setUser(newUser);
    
    setModalVisable(false);
  }

  useEffect(()=> {
    getUser(setLoading, setUser, setAllergies)
  }, []);



  function allergenTag(item: string, index: any){
      return ( 
          <TouchableOpacity key={index} style={[styles.tag, styles.selectedTag]}>
              <Text style={[styles.body, {color: 'white'}]}>{item}</Text>
          </TouchableOpacity>
      );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // force explicit navigation to sign-in screen
      router.replace("/Authentication/signIn"); // adjust path if your signIn is at /signIn
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  

  

  return (
    <>
      {
        loading ? (
          <View></View>

        ) : (
          <View style={styles.container}>
            <View style={styles.profileCard}>
              <View style={styles.nameWrapper}>
                <Text style={[styles.body, {fontSize: 30}]}>{user?.firstName} {user?.lastName}</Text>

              </View>
              <Text style={[styles.body,{textAlign: 'left', fontWeight: '500', width:'80%' }]}>Allergies:</Text>
              <ScrollView style={styles.scrollBox} contentContainerStyle={styles.row}>
                      {
                          user?.allergies.map((item: any, index: any) => (
                              allergenTag(item, index)
                          ))
                      }
              </ScrollView>
              
              <PopUp modalVisable={modalVisable} acceptPopUp={acceptPopUp} closePopUp={closePopUp} buttonText={"Modify Allergens"} Content={() => <AddAllergens selected={allergies} setSelected={setAllergies}/>}/>

              <TouchableOpacity
                  onPress={() => {setModalVisable(true)}}
                  style={styles.button}
              >
                  <Text style={[styles.body, {color: 'white'}]}>Change Allergens</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  onPress={() => {handleLogout()}}
                  style={[styles.button, {marginBottom: '45%', marginTop: 10, backgroundColor:'#FF5151'}]}
              >
                  <Text style={[styles.body, {color: 'white'}]}>Signout</Text>
              </TouchableOpacity>

              
              
            </View>
          </View>
        )
      }
      
    </>
    
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'white',
        flexDirection: 'column'
    },
    nameWrapper: {
      width: '100%',
      height: '10%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileCard:{
      width: '100%',
      height: '110%',
      borderRadius: '20%',
      alignItems: "center",
      position: 'absolute',
      bottom: '-20%',
      backgroundColor: '#B5D5FF',
    },
    
    body:{
        fontSize: 20,
        fontFamily:'DM-Sans',
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
