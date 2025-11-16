import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  deleteUser,
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth, db } from "../../src/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPW, setConfirmPW] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "1004457801974-9a70hbmbbf1sgkp013f5smohv9fl2bdh.apps.googleusercontent.com",
    redirectUri: "https://smartcart-5cb29.firebaseapp.com/__/auth/handler",
    scopes: ["openid", "email", "profile"],
  });

  // ---------------------------------------------------------------------
  // STEP 1 — Validate + check email doesn't exist
  // ---------------------------------------------------------------------
const handleSignUp = async () => {
  if (password !== confirmPW) {
    Alert.alert("Error", "Passwords do not match!");
    return;
  }
  if (!email || !password || !firstName || !lastName) {
    Alert.alert("Error", "Please fill out all fields");
    return;
  }

  setLoading(true);
  try {
    // Create the actual user
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Send verification email
    await sendEmailVerification(cred.user);

    Alert.alert(
      "Verify Email",
      "A verification email has been sent. Please check your inbox and click the link."
    );

    // Move to verification screen
    setStep("verify");

  } catch (err: any) {
    Alert.alert("Error", err.message);
  } finally {
    setLoading(false);
  }
};


  const sendVerificationEmailOnly = async () => {
    setLoading(true);

    try {
      // 1. Create a temporary user
      const tempCred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Send verification email
      await sendEmailVerification(tempCred.user);

      Alert.alert(
        "Verification Sent",
        "A verification email has been sent. Please check your inbox."
      );

      // 3. Immediately delete the temp user so it does NOT appear in Auth
      await deleteUser(tempCred.user);
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------
  // STEP 2 — User presses "I Verified My Email"
  // Create REAL account ONLY after user has verified
  // ---------------------------------------------------------------------
const handleFinalizeSignUp = async () => {
  setLoading(true);

  try {
    if (!auth.currentUser) {
      Alert.alert("Error", "User session expired. Please sign up again.");
      setStep("form");
      return;
    }

    // Reload user to get fresh emailVerified state
    await auth.currentUser.reload();

    if (!auth.currentUser.emailVerified) {
      Alert.alert("Not Verified", "Your email is not verified yet.");
      return;
    }

    // Verified — now write to Firestore
    const uid = auth.currentUser.uid;

    await setDoc(doc(db, "users", uid), {
      userID: uid,
      firstName,
      lastName,
      allergies: [],
      createdAt: Date.now(),
    });

    await updateProfile(auth.currentUser, { displayName: firstName });

    router.replace("/Profile-Creation/introduction");
  } catch (err: any) {
    Alert.alert("Error", err.message);
  } finally {
    setLoading(false);
  }
};


const deleteCurrentUser = async () => {
  try {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
      console.log("Temporary user deleted.");
    }
  } catch (err: any) {
    console.log("Error deleting user:", err.message);
  }
};



  // ---------------------------------------------------------------------
  // Google Login
  // ---------------------------------------------------------------------
  React.useEffect(() => {
    const go = async () => {
      if (response?.type === "success") {
        const idToken = (response.params as any)?.id_token;
        if (!idToken) {
          Alert.alert("Google sign-in failed");
          return;
        }
        const cred = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, cred);
        router.replace("/Profile-Creation/introduction");
      }
    };
    go();
  }, [response]);

  // ---------------------------------------------------------------------
  // VERIFICATION SCREEN
  // ---------------------------------------------------------------------
  if (step === "verify") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.body}>
          Please verify your email before creating your account:
        </Text>

        <Text style={[styles.body, { fontWeight: "bold", marginBottom: 20 }]}>
          {email}
        </Text>

        <Text style={[styles.body, { marginBottom: 30 }]}>
          First, send a verification email. Then click "I Verified My Email"
          after confirming the link in your inbox.
        </Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            {/* --- SEND VERIFICATION EMAIL BUTTON --- */}
            <Pressable
              style={[styles.button, { backgroundColor: "#ccc", marginTop: 10 }]}
              onPress={async () => {
                try {
                  if (!auth.currentUser) return;

                  await sendEmailVerification(auth.currentUser);
                  Alert.alert("Verification Sent", "Check your inbox for the email.");
                } catch (err: any) {
                  console.log("Error resending verification:", err.message);

                  if (err.code === "auth/too-many-requests") {
                    Alert.alert(
                      "Slow Down",
                      "You have requested too many verification emails. Please wait a few minutes before trying again."
                    );
                    return;
                  }

                  Alert.alert("Error", err.message);
                }
              }}

            >
              <Text style={[styles.body, { color: "#000" }]}>
                Resend Verification Email
              </Text>
            </Pressable>


            {/* --- CONFIRM EMAIL VERIFIED BUTTON --- */}
            <Pressable
              style={[styles.button, { marginTop: 12 }]}
              onPress={handleFinalizeSignUp}
            >
              <Text style={[styles.body, { color: "#fff" }]}>
                I Verified My Email
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: "#ccc", marginTop: 12 }]}
              onPress={async () => {
                await deleteCurrentUser();   // delete temp account
                setStep("form");             // go back to form
              }}
            >
              <Text style={[styles.body, { color: "#000" }]}>
                Back to Edit Email
              </Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  // ---------------------------------------------------------------------
  // FORM SCREEN
  // ---------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.formWrapper}>
          <Image
            source={require("../../assets/logos/logo2.png")}
            style={{
              width: "90%",
              height: 60,
              alignSelf: "center",
              marginBottom: 30,
              marginTop: 30,
            }}
            resizeMode="contain"
          />
          <Text style={[styles.title, { marginTop: -10 }]}>Create an Account</Text>

          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPW}
            onChangeText={setConfirmPW}
            placeholder="Confirm Password"
            secureTextEntry
          />

          {loading ? (
            <ActivityIndicator style={{ margin: 28 }} />
          ) : (
            <Pressable style={styles.button} onPress={handleSignUp}>
              <Text style={{ color: "#fff" }}>Continue</Text>
            </Pressable>
          )}

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Already have an account?</Text>
            <Pressable onPress={() => router.push("/Authentication/signIn")}>
              <Text style={styles.linkAction}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    paddingTop: 100,
  },
  formWrapper: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: "DMSans-bold",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
    fontFamily: "DM-Sans",
  },
  body: {
    fontFamily: "DMSans",
    fontWeight: "400",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 5,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: "#d4cfcfff",
    padding: 10,
    fontFamily: "DM-Sans",
    width: "100%",
  },
  button: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#5ca3ff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  linkRow: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 12,
  },
  linkText: { color: "#6b7280" },
  linkAction: { color: "#2563eb", fontWeight: "600" },
  tag: {
    backgroundColor: "#FF5151",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  smallButton: {
    backgroundColor: "#5CA3FF",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  smallButtonText: { color: "#fff", fontWeight: "600" },
});
