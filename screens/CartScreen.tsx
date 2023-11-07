import React, { useState } from "react";
import { View, StyleSheet, Text, Modal } from "react-native";
import Screen from "../components/Screen";
import tailwind from "tailwind-react-native-classnames";
import AppHead from "../components/AppHead";
import AppButton from "../components/AppButton";
import {
  selectBasketItems,
} from "../redux/slices/basketSlice";
import { useSelector } from "react-redux";
import colors from "../configs/colors";
import CartItems from "../components/CartItems";
import CheckoutModal from "../components/CheckoutModal";
import { RootState } from "../redux/types";

const CartScreen = () => {
 
  const items = useSelector((state: RootState) => selectBasketItems(state));
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const getAllItems = items.length;


  const [modalVisible, setModalVisible] = useState(false);

  return (
    <Screen style={tailwind`flex-1`}>
      <AppHead
        title={`Sua Bandeja (${getAllItems})`}
        icon="basket-outline"
      />
      <View style={tailwind`flex-1`}>
        <CartItems />
      </View>
      {!!getAllItems && (
        <View style={tailwind`flex-row items-center px-5 pb-5`}>
          <View style={styles.left}>
            <Text style={styles.total}>Total</Text>
            <Text style={styles.totalAmount}>{totalPrice}Kz</Text>
          </View>
          <View style={styles.right}>
            <AppButton
              title="Checkout"
              onPress={() => setModalVisible(true)}
              color="black"
            />
          </View>
        </View>
      )}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <CheckoutModal setModalVisible={setModalVisible} />
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  left: {
    marginRight: 20,
  },
  right: {
    flex: 1,
  },
  total: {
    fontSize: 14,
    color: colors.title,
  },
  totalAmount: {
    fontSize: 23,
  },
});

export default CartScreen;
