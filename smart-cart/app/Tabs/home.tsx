import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, ScrollView } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/src/FirebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { subscribeProductsByIds } from "../Database/products";

// thumbnail that goes back to the logo if image fails
function Thumb({ uri }: { uri?: string }) {
  const [err, setErr] = useState(false);
  const ok = !!uri && !err;
  return (
    <Image
      source={ok ? { uri } : require("../../assets/logos/logo3.png")}
      style={styles.thumb}
      resizeMode="contain"
      onError={() => setErr(true)}
    />
  );
}

export default function Home() {
  const [ready, setReady] = useState<boolean>(false);
  const [lists, setLists] = useState<any[]>([]);
  
  const [productMap, setProductMap] = useState<Record<string, any>>({});
  const productsUnsubRef = useRef<null | (() => void)>(null);

  // Track auth state 
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setReady(true));
    return () => unsub && unsub();
  }, []);

  // Subs to user shopping list
  useEffect(() => {
    if (!ready) return;

    const user = auth.currentUser;
    if (!user) {
      setLists([]);
      return;
    }

    const qRef = query(
      collection(db, "users", user.uid, "shoppingLists"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(qRef, (snap) => {
      const next: any[] = [];
      snap.forEach((d) => {
        const data = d.data() || {};
        next.push({
          id: d.id,
          name: data.name || "Untitled List",
          productIDs: Array.isArray(data.productIDs) ? data.productIDs : [],
          createdAt: data?.createdAt?.toDate?.() || new Date(0),
        });
      });
      setLists(next);
    });

    return () => unsub && unsub();
  }, [ready]);

  // Subs to products for all product ID in the list
  useEffect(() => {
    const allIds = Array.from(
      new Set(
        lists.flatMap((l) =>
          Array.isArray(l.productIDs) ? l.productIDs : []
        )
      )
    );
    if (productsUnsubRef.current) {
      productsUnsubRef.current();
      productsUnsubRef.current = null;
    }

    
    if (allIds.length === 0) {
      setProductMap({});
      return;
    }

  


    productsUnsubRef.current = subscribeProductsByIds(
      allIds,
      (map: Record<string, any>) => {
        setProductMap(map);
      }
    );

    return () => {

      if (productsUnsubRef.current) {
        productsUnsubRef.current();
        productsUnsubRef.current = null;
      }
    };
  }, [lists]);

  // Renders all lists 
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Shopping Lists</Text>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text numberOfLines={1} style={styles.cardTitle}>
                {item.name}
              </Text>
              <Text style={styles.cardCount}>
                {item.productIDs.length}{" "}
                {item.productIDs.length === 1 ? "item" : "items"}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(item.productIDs || []).map((pid: string, idx: number) => {
                const p = productMap[pid];
                const uri = p?.image || undefined;
                return <Thumb key={`${pid}-${idx}`} uri={uri} />;
              })}
            </ScrollView>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No lists yet. Create your first one!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  sep: {
    height: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderColor: "#eee",
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  cardCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 10,
  },
  emptyBox: {
    marginTop: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
  },
});
