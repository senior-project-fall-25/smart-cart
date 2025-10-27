// components/SmartCartStyles.tsx (move it OUT of app/)
import { Text } from "react-native";
import React from "react";

const ProductText = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: "DM-Sans", textAlign: "left", textTransform: "capitalize" }}>
        {children}
    </Text>
);

const ProductHeader = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: "DM-Sans-Medium", fontWeight: "800", textAlign: "left", textTransform: "capitalize", flexWrap: "wrap" }}>
        {children}
    </Text>
);

const ProductBrand = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: "DM-Sans", fontWeight: "600", textAlign: "left", textTransform: "capitalize", color: "gray", fontSize: 12 }}>
        {children}
    </Text>
);

export { ProductText, ProductHeader, ProductBrand };

// (optional, to keep Expo Router happy if it’s still inside /app)
export default function Empty() {
    return null;
}
