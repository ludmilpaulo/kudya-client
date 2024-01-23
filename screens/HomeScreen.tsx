import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import {
  UserIcon,
  ChevronDownIcon,
  AdjustmentsVerticalIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";


import tailwind from "tailwind-react-native-classnames";
import RestaurantItem from "../components/RestaurantItem";

import colors from "../configs/colors";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import Geocoder from "react-native-geocoding";
import * as Device from "expo-device";
import * as Location from "expo-location";

import { apiUrl, googleAPi } from "../configs/variable";

import { setUserLocation } from "../redux/slices/locationSlice";
import {
  selectDriverLocation,
  setDriverLocation,
} from "../redux/slices/driverLocationSlice";

import { Restaurant } from "../configs/types";

interface Category {
  id?: number;
  name?: string;
  image?: string;
  // Add other category properties if needed
}

interface CategoriesProps {
  onSelectCategory: (category: string) => void;
}




Geocoder.init(googleAPi);

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const user = useSelector(selectUser);

  //const userPosition = useSelector(setUserLocation);

  const driverPosition = useSelector(selectDriverLocation);

  const dispatch = useDispatch();

  const url = "https://www.kudya.shop";

  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("");

  const [userPhoto, setUserPhoto] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const [userId, setUserId] = useState<any>();
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurant[]>(
    []
  );
  const [masterDataSource, setMasterDataSource] = useState<Restaurant[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [currentLocation, setCurrentLocation] = useState<any>();
  const [driverCurrentLocation, setDriverCurrentLocation] = useState<
    any | null
  >(driverPosition?.location);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);


  useEffect(() => {
    fetchCategories();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        await pickUser();
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
  
    fetchData(); // Call fetchData immediately when the component mounts
  
    const timer = setInterval(() => {
      fetchData(); // Fetch user data every 2000 milliseconds (2 seconds)
    }, 2000);
  
    // Clear the interval when the component is unmounted
    return () => clearInterval(timer);
  }, []);
  


  const pickUser = async () => {
    try {
      let response = await fetch(
        `${apiUrl}/api/customer/profile/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.user_id,
          }),
        }
      );
  
      if (response.ok) {
        let responseJson = await response.json();
     
  
        // Check if customer_details is defined before accessing its properties
        if (responseJson.customer_detais) {
          const customerDetails = responseJson.customer_detais;
  
          // Check if avatar is not null or undefined
          if (
            customerDetails.avatar !== undefined &&
            customerDetails.avatar !== null
          ) {
            // Avatar is not null, set the user photo
            setUserPhoto(customerDetails.avatar);
          } else {
            // Avatar is null or undefined, redirect to UserProfile
            navigation.navigate("UserProfile");
            
          }
  
          // Assuming you want to set user phone as well, update the state
          setUserPhone(customerDetails.phone);
  
          // Assuming you want to set user ID as well, update the state
          setUserId(customerDetails.user_id);
        } else {
          // customer_details is not defined
          console.error("customer_details is not defined");
        }
      } else {
        // Handle non-successful response
        console.error(
          "Error fetching user profile. HTTP status:",
          response.status
        );
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error("Error in pickUser:", error);
      // You may want to throw the error to be caught by the calling function
      throw error;
    }
  };
  
  
  const customer_avatar = `${userPhoto}`;
  const customer_image = `${url}${customer_avatar}`;

 
  const userLocation = async () => {
    if (Platform.OS === "android" && !Device.isDevice) {
      alert(
        "Oops, this will not work on Snack in an Android Emulator. Try it on your device!"
      );
      return;
    }
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    // dispatch(setLocation(location.coords))
    // console.log(location.coords)
    setCurrentLocation(location.coords);
    dispatch(
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    );


    Geocoder.from(location?.coords)
      .then((response: { results: { formatted_address: any; }[]; }) => {
        const formattedAddress = response.results[0].formatted_address;
        setAddress(formattedAddress);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getRestaurant();
  }, []);

  const getRestaurant = async () => {
    try {
      fetch(`${apiUrl}/api/customer/restaurants/`)
        .then((response) => response.json())
        .then((responseJson) => {
          //  setRestaurantData(responseJson?.restaurants);
          setFilteredDataSource(responseJson?.restaurants);
          setMasterDataSource(responseJson?.restaurants);
        })
        .catch(function (error) {
          console.log(
            "There has been a problem with your fetch operation: " +
              error.message
          );
          // ADD THIS THROW error
          throw error;
        });
    } catch (e) {
      alert(e);
    }
  };

  ///******************************Procurar************************* */
  const searchFilterFunction = (text: any) => {
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataSource and update FilteredDataSource
      const newData = masterDataSource.filter(function (item) {
        // Applying filter for the inserted text in search bar
        const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with restaurantData
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/customer/restaurants/`);
      const data = await response.json();
  
      // Initialize an object to track unique categories based on their names
      const uniqueCategories: { [key: string]: Category } = {};
  
      // Iterate through the restaurants and add their primary category names to the uniqueCategories object
      data?.restaurants.forEach((restaurant:any) => {
        const restaurantCategory = restaurant?.category;
  
        if (
          restaurantCategory &&
          typeof restaurantCategory === 'object' &&
          'name' in restaurantCategory &&
          typeof restaurantCategory.name === 'string' &&
          typeof restaurantCategory.image === 'string'
        ) {
          const categoryName = restaurantCategory.name;
  
          // Add the category to the uniqueCategories object using its name as the key
          uniqueCategories[categoryName] = {
            id: Object.keys(uniqueCategories).length, // Use the current length as a unique identifier
            name: categoryName,
            image: restaurantCategory.image || 'defaultImageUrl',
          };
        }
      });
  
      // Convert the values of uniqueCategories object to an array
      const categoriesArray: Category[] = Object.values(uniqueCategories);
  
    
  
      setCategories(categoriesArray);
      setLoading(false); // Set loading to false once categories are set
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filterType = (category: any, showBanner: boolean | null = null) => {
    setSelectedCategory(category);
  
    setFilteredDataSource(
      masterDataSource.filter((item) => {
        // Check if the category matches
        const categoryMatch = item?.category?.name === category;
  
        // Check if the item is approved
        const isApproved = item.is_approved === true;
  
        // Check if the banner condition matches
        const bannerMatch =
          showBanner === null || item.barnner === showBanner;
  
        // Return true if all conditions are met
        return categoryMatch && isApproved && bannerMatch;
      })
    );
  };
  
  
  
  
  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        accessibilityLabel="Loading categories"
      />
    );
  }

  return (
    <SafeAreaView style={tailwind`bg-white pt-5`}>
      {/* Header */}
      <View style={tailwind`flex-row pb-3 mt-8 items-center mx-4 ml-2`}>
        <Image
          source={{ uri: customer_image }}
          style={tailwind`h-12 w-12 p-4 rounded-full`}
        />
  
        <View style={tailwind`flex-1`}>
          <Text style={tailwind`font-bold text-gray-400 text-xs`}>Deliver Now!</Text>
          <Text style={tailwind`font-bold text-xl`}>
            {address}
            <ChevronDownIcon size={20} color="#004AAD" />
          </Text>
        </View>
  
        <UserIcon size={35} color="#004AAD" />
      </View>
  
      <View style={tailwind`flex-row items-center ml-2 pb-2 mx-4`}>
        <View style={tailwind`flex-row flex-1 ml-2 bg-gray-200 p-3`}>
          <MagnifyingGlassIcon color="#004AAD" size={20} />
          <TextInput
            onChangeText={(text) => searchFilterFunction(text)}
            value={search}
            placeholder="Restaurantes e cozinhas"
            keyboardType="default"
          />
        </View>
  
        <AdjustmentsVerticalIcon color="#004AAD" />
      </View>
  
  {/* Body */}
  <ScrollView
        style={tailwind`bg-white`}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >

         {/* Categories */}
         <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingTop: 10,
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={tailwind`relative mr-2`}
              onPress={() => filterType(category.name)}
            >
              <Image source={{ uri: category.image }} style={tailwind`h-20 w-20 rounded`} />
              <Text style={tailwind`text-black font-bold`}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Categories */}

        {loading && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={tailwind`mt-2 mb-6`}
          />
        )}

<RestaurantItem
  title={"Apresentou"}
  description={"Canais pagos de nossos parceiros"}
  restaurantData={filteredDataSource.filter(item => item.barnner === true)}
/>

        <RestaurantItem
          title={"Ofertas perto de você"}
          description={"por que não apoiar o seu restaurante local"}
          restaurantData={filteredDataSource}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;