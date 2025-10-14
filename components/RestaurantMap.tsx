import React from "react";
import { View, StyleSheet, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import tw from "twrnc";

const storeMap = ({
  coordinates,
  title,
}: {
  coordinates: any;
  title: any;
}) => {
  return (
    <View style={[tw`bg-blue-300 relative`, { height: 250 }]}>
      <MapView
        region={{
          ...coordinates,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        style={tw`h-full z-10`}
      >
        {coordinates && (
          <Marker
            coordinate={{
              ...coordinates,
            }}
            identifier="shop"
            anchor={{ x: 0.5, y: 0.5 }}
            title={title}
          >
            <Image
              source={require("../assets/shop.png")}
              style={{ height: 27, width: 27 }}
            />
          </Marker>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({});

export default storeMap;
