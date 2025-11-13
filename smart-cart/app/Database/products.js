import { db } from "@/src/FirebaseConfig";
import { collection, query, where, documentId, onSnapshot, doc, setDoc } from "firebase/firestore";

//image URLs 
const norm = (u) => {
  if (!u) return "";
  return u.startsWith("http://") ? "https://" + u.slice(7) : u;
};

// Split ids for firestore  
const chunk = (arr, size = 10) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

// Save one product under products and id
export const saveProduct = async (product) => {
  if (!product || !product.id) return;
  const image =
    norm(product.image) ||
    norm(product.image_front_url) ||
    norm(product.image_url) ||
    norm(product.photoUrl) ||
    "";
  const ref = doc(db, "products", product.id);
  await setDoc(ref, { title: product.title || "", image }, { merge: true });
};

// Subs to products by id and return a map
export const subscribeProductsByIds = (ids, onChange) => {
  const uniq = Array.from(new Set(ids || [])).filter(Boolean);
  if (uniq.length === 0) {
    onChange && onChange({});
    return () => {};
  }

  const productsCol = collection(db, "products");
  const local = {};
  const unsubs = [];

  for (const group of chunk(uniq, 10)) {
    const qRef = query(productsCol, where(documentId(), "in", group));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        snap.docChanges().forEach((chg) => {
          const d = chg.doc.data() || {};
          local[chg.doc.id] = {
            id: chg.doc.id,
            title: d.title || d.name || "",
            image: norm(d.image || d.imgUrl || d.photo),
          };
        });
        onChange && onChange({ ...local });
      },
      (err) => {
        console.error("[subscribeProductsByIds]", err);
      }
    );
    unsubs.push(unsub);
  }

  return () => unsubs.forEach((u) => u && u());
};
