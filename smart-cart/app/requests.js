import { auth,db } from "@/src/FirebaseConfig";
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';

// not using this yet ** but will

const createUser = async () => {

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

const addAllergens = async (allergens) => {

    const userID = currentUser?.uid;

    if(userID){
        try {
            const userRef = doc(db, "users", userID);

            await updateDoc (userRef, {
                allergies : allergens,
            })
            
            console.log('added allergens added to id: ', userID);
            router.replace('/(tabs)/home')
        }
        catch (error) {
            console.log('error creating new profile: ', error);
            return null;
        }

    }

    
};
