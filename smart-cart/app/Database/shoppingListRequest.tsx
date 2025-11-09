import { auth, db } from "@/src/FirebaseConfig";
import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion, getDocs } from "firebase/firestore";

// Type for ShoppingList (optional)
export type ShoppingList = {
  id: string;
  name: string;
  createdAt: Date;
  productIDs?: string[];
};

// Create a new shopping list
export const addShoppingList = async (listName: string): Promise<ShoppingList> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const listsRef = collection(db, "users", user.uid, "shoppingLists");
  const newListRef = await addDoc(listsRef, {
    name: listName,
    productIDs: [],
    createdAt: Timestamp.now(),
  });

  return {
    id: newListRef.id,
    name: listName,
    createdAt: new Date(),
    productIDs: [],
  };
};

// Fetch all shopping lists for the current user
export const fetchUserShoppingLists = async (): Promise<ShoppingList[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const listsRef = collection(db, "users", user.uid, "shoppingLists");
  const snapshot = await getDocs(listsRef);

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      createdAt: data.createdAt?.toDate() || new Date(),
      productIDs: data.productIDs || [],
    };
  });
};

// Add an item to an existing shopping list by pushing product ID
export const addItemToShoppingList = async (product: any, listId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const listDocRef = doc(db, "users", user.uid, "shoppingLists", listId);

  try {
    await updateDoc(listDocRef, {
      productIDs: arrayUnion(product.id),
    });

    console.log(`Product ${product.title} added to list ${listId}`);
  } catch (err) {
    console.error("Error adding product to shopping list:", err);
  }
};
