import React from "react";
import { View, StyleSheet, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import tw from "twrnc";

const storeMap = ({
  coordinates,
  title,
}: {
  coordinates: { latitude: number; longitude: number };
  title: string;
}) => {
  return (
    <View style={[tw`bg-blue-300 relative`, { height: 250 }]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={coordinates} title={title} />
      </MapView>
      <Image
        source={require("../assets/marker.png")}
        style={styles.marker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  marker: {
    position: "absolute",
    width: 30,
    height: 30,
    bottom: 10,
    right: 10,
  },
});

export default storeMap;
