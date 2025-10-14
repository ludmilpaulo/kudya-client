import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import tw from "twrnc";

const ViewCart = ({ total, count }: { total: any; count: any }) => {
  const navigation = useNavigation<any>();

  return (
    <>
      {!!count && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          style={tw`bg-blue-500 absolute bottom-4 self-center py-3 px-12 h-12 rounded-full z-50`}
        >
          <Text style={tw`text-white text-xl font-bold`}>
            Ver sua Bandeja • {total}Kz ({count})
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default ViewCart;