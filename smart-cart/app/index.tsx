import { Link, useRouter } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>This is just a launchpad for basic stuff in profile creation.</Text>
      <TouchableOpacity
          onPress={()=> router.replace('/introduction')}
                      
        >
            <Text >Start profile creation</Text>
        </TouchableOpacity>
    </View>
  );
}
