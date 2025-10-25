// components/SmartCartStyles.tsx (move it OUT of app/)
import { Text } from "react-native";
import React from "react";

const ProductText = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontFamily: "DM-Sans", textAlign: "left", textTransform: "capitalize" }}>
    {children}
  </Text>
);

const ProductHeader = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontFamily: "DM-Sans-Bold", textAlign: "left", textTransform: "capitalize" }}>
    {children}
  </Text>
);

export { ProductText, ProductHeader };

// (optional, to keep Expo Router happy if it’s still inside /app)
export default function Empty() {
  return null;
}
