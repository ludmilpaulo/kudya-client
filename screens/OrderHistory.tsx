import React, { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import {
  selectTotalItems,
  selectTotalPrice,
} from "../redux/slices/basketSlice";

import { View, Text, Image, TouchableOpacity } from "react-native";

import tailwind from "tailwind-react-native-classnames";

import Screen from "../components/Screen";
import XCircleIcon from "react-native-heroicons/outline/XCircleIcon";
import { useNavigation } from "@react-navigation/native";

interface Order {
  customer: any;
  driver: any;
  order_details: any;
  address: ReactNode;
  status: ReactNode;
  total: ReactNode;
  restaurant: any;
  id?: number;
}

const OrderHistory = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const navigation = useNavigation();
  const [data, setData] = useState<any[]>([]);

  const orderHistory = async () => {
    let response = await fetch(
      "https://www.sunshinedeliver.com/api/customer/order/history/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: user?.token,
        }),
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setData(responseJson?.order_history);
        console.log("dta==>", responseJson.order_history);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    console.log("dta==>", data);
    orderHistory();
  }, []);

  return (
    <>
      <Screen style={tailwind``}>
        <View style={tailwind`flex-row justify-between items-center p-5`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <XCircleIcon color="#004AAD" size={30} />
          </TouchableOpacity>
          <Text style={tailwind`font-light text-lg`}>Delivery</Text>
        </View>
        {data.map((order) => (
          <View
            style={tailwind`bg-white mx-5 my-2 rounded-md p-6 z-50 shadow-md`}
          >
            <View style={tailwind`flex-row justify-between`}>
              <View>
                <Text style={tailwind`text-lg text-gray-400`}>
                  Restaurant {order?.restaurant?.name}
                </Text>

                <Text>
                  {" "}
                  Telefone
                  {order?.restaurant?.phone}
                </Text>

                <View style={tailwind`text-4xl font-bold`}>
                  {order?.order_details.map(
                    (detais: {
                      meal: {
                        name:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | React.ReactFragment
                          | React.ReactPortal
                          | null
                          | undefined;
                        price:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | React.ReactFragment
                          | React.ReactPortal
                          | null
                          | undefined;
                      };
                      quantity:
                        | string
                        | number
                        | boolean
                        | React.ReactElement<
                            any,
                            string | React.JSXElementConstructor<any>
                          >
                        | React.ReactFragment
                        | React.ReactPortal
                        | null
                        | undefined;
                      sub_total:
                        | string
                        | number
                        | boolean
                        | React.ReactElement<
                            any,
                            string | React.JSXElementConstructor<any>
                          >
                        | React.ReactFragment
                        | React.ReactPortal
                        | null
                        | undefined;
                    }) => (
                      <View
                        style={tailwind`flex md:flex-row justify-start items-start md:items-center  border border-gray-200 w-full`}
                      >
                        <View
                          style={tailwind`flex justify-start md:justify-between items-start md:items-center  flex-col md:flex-row w-full p-4 md:px-8`}
                        >
                          <View
                            style={tailwind`flex flex-col md:flex-shrink-0  justify-start items-start`}
                          >
                            <Text
                              style={tailwind`text-lg md:text-xl  font-semibold leading-6 md:leading-5  text-gray-800`}
                            >
                              {detais.meal.name}
                            </Text>
                            <View
                              style={tailwind`flex flex-row justify-start  space-x-4 md:space-x-6 items-start mt-4 `}
                            >
                              <Text
                                style={tailwind`text-sm leading-none text-gray-600`}
                              >
                                Preco:{" "}
                                <Text style={tailwind`text-gray-800`}>
                                  {detais.meal.price} Kz
                                </Text>
                              </Text>
                              <Text>
                                Quantidade:{" "}
                                <Text style={tailwind`text-gray-800`}>
                                  {detais?.quantity}
                                </Text>
                              </Text>
                            </View>
                          </View>
                          <View
                            style={tailwind`flex mt-4 md:mt-0 md:justify-end items-center w-full `}
                          >
                            <Text
                              style={tailwind`text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-gray-800`}
                            >
                              {detais?.sub_total} Kz
                            </Text>
                          </View>
                        </View>
                      </View>
                    )
                  )}
                </View>
              </View>
              <Image
                source={{ uri: order?.driver?.avatar }}
                style={tailwind`h-20 w-20`}
              />
            </View>
          </View>
        ))}
      </Screen>
    </>
  );
};

export default OrderHistory;
