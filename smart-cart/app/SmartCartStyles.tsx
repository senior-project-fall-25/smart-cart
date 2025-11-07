import { Text } from "react-native";
import React from "react";

const ProductText = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: "DM-Sans", textAlign: "left", textTransform: "capitalize" }}>
        {children}
    </Text>
);

const ProductHeader = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: "DM-Sans-Medium", fontWeight: "800", textAlign: "left", textTransform: "capitalize", flexWrap: "wrap" }} numberOfLines={2} ellipsizeMode="tail">
        {children}
    </Text>
);

const ProductBrand = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: "DM-Sans", fontWeight: "600", textAlign: "left", textTransform: "capitalize", color: "gray", fontSize: 12 }} numberOfLines={1} ellipsizeMode="tail">
        {children}
    </Text>
);

export { ProductText, ProductHeader, ProductBrand };

export default function Empty() {
    return null;
}
