import { auth,db } from "@/src/FirebaseConfig";
import { addDoc, collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from "expo-router";

// not using this yet ** but will

export const createUser = async () => {

    const userID = auth.currentUser?.uid;
    

    if (userID){
        try {
        // input the database, dabase table name, and custom doc id
        const docRef = doc(db, "users", userID)
        
        await setDoc(docRef, {
            userID: userID,
            firstName: firstName,
            lastName: lastName,
            // allergens field added in finish profile
        });

        console.log('new user created with id: ', userID);
        }
        catch (error) {
            console.log('error creating new profile: ', error);
            return null;
        }

    }
};

export const getUser = async(setLoading, setUser, setAllergies) => {
    // this doesnt work yet!!
    setLoading(true)
    var data = null;
    const userID = auth.currentUser?.uid;
    if (userID){
        try{
            const docRef = doc(db, "users", userID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()){
                data = docSnap.data();
                console.log("Got data for current user:", data)
                setLoading(false);
                setUser(data);
                setAllergies(data.allergies);
            }

        } catch(error) {
            console.log("Failed to fetch user document: ", error)
        }
    } else {
        console.log("Failed to get current user!")
    }

    
}

export const changeAllergens = async (allergens) => {
    console.log('in change allergens')

    const userID = auth.currentUser?.uid;

    if(userID){
        try {
            const userRef = doc(db, "users", userID);

            await updateDoc (userRef, {
                allergies: allergens,
            })
            
            console.log('added allergens to user with id: ', userID);
        }
        catch (error) {
            console.log('error creating new profile: ', error);
            return null;
        }

    }
};

