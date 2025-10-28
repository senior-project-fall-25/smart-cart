
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Text, View, StyleSheet, KeyboardAvoidingView, TextInput, Button, ActivityIndicator, Pressable, Alert } from "react-native";
import { auth } from "@/src/FirebaseConfig";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { FirebaseError } from "firebase/app";
import { Image } from "react-native";

WebBrowser.maybeCompleteAuthSession();


export default function signUp() {

    const [name, setName] = useState ('');
    const [email, setEmail] = useState ('');
    const [password, setPassword] = useState('');
    const [confirmPW, setConfirmPW] = useState('');
    const [loading, setLoading] = useState (false);


    //redirecturi func to route firebsase from google Auth
    const redirectUri = makeRedirectUri();
  
    
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: "1004457801974-9a70hbmbbf1sgkp013f5smohv9fl2bdh.apps.googleusercontent.com", // google Auth client ID
        redirectUri:'https://smartcart-5cb29.firebaseapp.com/__/auth/handler', // firebase URI route
        scopes: ["openid", "email", "profile"],
    });

    

    //sign up func
    const handlesignUp = async () => {
        if( password !== confirmPW){
            alert("Passwprds Do Not Match!")
            return;
        }
    
    setLoading(true); //lets spinning whel play while information loads
    try{
        const user  = await createUserWithEmailAndPassword(auth, email, password);
        router.replace('/(tabs)/home');
    } catch (error: any){
        const err = error as FirebaseError;
        alert('Sign up in Failed: ' + error.message);
    }finally{
        setLoading(false);
    }
    }
    
    //google button press initializer 
    const onGooglePress =  async() => {
        setLoading(true);
        try{
        await promptAsync();
        } finally{

        }
    }

    //cases for google Auth
    useEffect(() => {
    const go = async () => {
        if (response?.type === "success") {
        const idToken = (response.params as any)?.id_token;
        if (!idToken) { setLoading(false); alert("Google sign-in failed"); return; }
        const cred = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, cred);
        setLoading(false);
        router.replace('/(tabs)/home');
        } else if (response?.type === "error") {
        setLoading(false);
        alert("Google sign-in error");
        } else if (response?.type === "dismiss" || response?.type === "cancel") {
        setLoading(false);
        }
        };
        go();
    }, [response]);

  return (
    <View
      style={styles.container}
    >
      <KeyboardAvoidingView behavior="padding">
        <Image 
        source={require("../assets/logos/logo2.png")}
        style={{width: "90%",height:60, alignSelf: 'center', marginBottom:50}}
        resizeMode="contain"
        />

        <Text style={styles.title}> Create an Account </Text>
        <Text style={styles.body}> Enter your credentials to start using SmartCart!</Text>
        

        <TextInput
          style={[styles.input, styles.inputText]}
          value={name}
          onChangeText={setName}
          placeholder="Jane Doe"
        
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="JaneDoe@domain.com"
        
        />
        <TextInput
          style={[styles.input, styles.inputText]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
        />
         <TextInput
          style={[styles.input, styles.inputText]}
          value={confirmPW}
          onChangeText={setConfirmPW}
          secureTextEntry
          placeholder="Confirm Password"
        />
        { loading ? (
          <ActivityIndicator size={'small'} style = {{margin: 28}}/>
        ) :(
          <>
            <Pressable style={styles.button} onPress={handlesignUp}>
              <Text style={[styles.body, {color:'#fff'}]}> Continue</Text>
            </Pressable>
            
            

          </>
        )}

        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/signIn")} accessibilityRole="button" accessibilityLabel="Sign up">
          <Text style={styles.linkAction}>Sign In</Text>
          </Pressable>
        </View>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable style={styles.googleBtn}  accessibilityRole="button"  onPress={onGooglePress} accessibilityLabel="Sign in with Google">
          <Image source={require("../assets/logos/SU-Round.png")} style={styles.googleIcon} />
        </Pressable>
        

        
      </KeyboardAvoidingView>
      
    </View>
  );
}


const styles = StyleSheet.create({ 
  container:{
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingTop: 100

  },
  
  title: {
  fontFamily: "DMSans-bold",   
  fontSize: 24,
  textAlign: "center",
  marginBottom: 5
},

body: {
  fontFamily: "DMSans",
  fontWeight: "400",   
  fontSize: 14,
  textAlign: 'center',
  marginBottom: 5
},

inputText: {
  fontFamily: "DMSans",
  fontWeight: "400",
  fontSize: 16,
  
},
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 15, 
    borderColor:'#d4cfcfff',
    padding: 10,
    backgroundColor:'#fff',
  },

 button: {
  alignSelf: "stretch",
  height: 50,
  borderRadius: 12,
  backgroundColor: "#5ca3ff", 
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
 },

 dividerRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginVertical: 16,
  marginTop: 32

},
dividerLine: {
  flex: 1,
  height: 1,
  backgroundColor: "#e5e7eb",
},
dividerText: {
  color: "#6b7280",
  fontSize: 14,
  fontWeight: "600",
},

googleBtn: {
  alignSelf: "center",
  width: '57%',
  height: 50,
  borderRadius: 45,
  borderWidth: 1,
  borderColor: "#e5e7eb",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
},
googleIcon: { width: 200, height: 200, resizeMode: "contain" },


linkRow: {
  flexDirection: "row",
  alignSelf: "center",
  marginTop: 12,
  marginBottom: 8, 
},
linkText: {
  fontSize: 14,
  color: "#6b7280",
},
linkAction: {
  fontSize: 14,
  color: "#2563eb",
  fontWeight: "600",
},

})