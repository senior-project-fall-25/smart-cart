import { auth, db } from "@/src/FirebaseConfig";
import { collection, addDoc, setDoc, Timestamp, doc, updateDoc, arrayUnion, getDocs } from "firebase/firestore";

export type ShoppingList = {
  id: string;
  name: string;
  createdAt: Date;
  productIDs?: string[];
};

export type ProductInfo = {
  id: string;
  title: string;
  brand: string;
  image?: string | null;
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


export const saveProductToDB = async (product: any) => {
  if (!product?.id) throw new Error("Product must have an ID");

  const productRef = doc(db, "products", product.id);

  try {
    await setDoc(productRef, {
      title: product.title,
      brand: product.brand,
      image: product.image || null,
    }, { merge: true }); // merge keeps existing fields
    console.log("Product saved to DB:", product.title);
  } catch (err) {
    console.error("Error saving product to DB:", err);
    throw err;
  }
};