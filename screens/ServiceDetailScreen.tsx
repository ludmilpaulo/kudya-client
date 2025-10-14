import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import tw from "twrnc";
import { useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { getServiceById, getServiceAvailability, createBooking } from "../services/servicesApi";
import { RootState } from "../redux/store";
import { useTranslation } from "../hooks/useTranslation";

export default function ServiceDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const { serviceId } = route.params;
  const { user, token } = useSelector((s: RootState) => s.auth);

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getServiceById(serviceId);
        if (!mounted) return;
        setService(data);
        const avail = await getServiceAvailability(serviceId, selectedDate, selectedDate);
        if (!mounted) return;
        const daySlots = avail.available_slots[selectedDate] || [];
        setSlots(daySlots);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load service");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [serviceId, selectedDate]);

  const handleBook = async () => {
    if (!user || !token) {
      Alert.alert("Please log in first");
      return;
    }
    if (!selectedTime || !service) return;
    setBookingLoading(true);
    try {
      await createBooking({
        service: service.id,
        customer: user.user_id, // Adapt if needed
        booking_date: selectedDate,
        booking_time: selectedTime,
        duration_minutes: service.duration_minutes,
        customer_notes: note,
        payment_method: "card",
      });
      Alert.alert("Booking created!");
    } catch (e: any) {
      Alert.alert(e?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#3B82F6" style={tw`mt-10`} />;
  if (error) return <Text style={tw`text-red-600 text-center mt-10`}>{error}</Text>;
  if (!service) return null;

  return (
    <ScrollView style={tw`flex-1 bg-white p-4`}>
      {service.image ? (
        <Image source={{ uri: service.image }} style={tw`w-full h-48 rounded-xl mb-3`} resizeMode="cover" />
      ) : (
        <View style={tw`w-full h-48 rounded-xl bg-gray-200 mb-3 items-center justify-center`}>
          <Text style={tw`text-gray-400`}>No Image</Text>
        </View>
      )}
      <Text style={tw`text-2xl font-bold text-gray-800`}>{service.title}</Text>
      <Text style={tw`text-gray-600`}>{service.parceiro_name}</Text>
      <Text style={tw`text-blue-700 font-bold mt-2`}>
        {service.price.toFixed(2)} {service.currency}
      </Text>
      <Text style={tw`mt-3 text-gray-700`}>{service.description}</Text>

      <View style={tw`mt-6 border border-gray-300 rounded-xl p-4`}>
        <Text style={tw`font-semibold mb-2`}>Availability</Text>
        {/* Date picker placeholder - use a library if needed */}
        <TextInput
          style={tw`border border-gray-300 rounded px-3 py-2 mb-3`}
          placeholder="YYYY-MM-DD"
          value={selectedDate}
          onChangeText={setSelectedDate}
        />

        <View style={tw`flex-row flex-wrap gap-2 mb-3`}>
          {slots.length === 0 && <Text style={tw`text-gray-500`}>No slots available</Text>}
          {slots.map((s) => (
            <TouchableOpacity
              key={s.time}
              onPress={() => setSelectedTime(s.time)}
              disabled={!s.available}
              style={[
                tw`px-3 py-2 rounded border`,
                selectedTime === s.time ? tw`bg-black border-black` : tw`bg-white border-gray-300`,
                !s.available && tw`opacity-50`,
              ]}
            >
              <Text style={selectedTime === s.time ? tw`text-white` : tw`text-black`}>{s.time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={tw`border border-gray-300 rounded px-3 py-2 mb-3`}
          placeholder="Notes"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity
          style={[tw`bg-green-600 rounded px-4 py-3`, (!selectedTime || bookingLoading) && tw`opacity-50`]}
          onPress={handleBook}
          disabled={!selectedTime || bookingLoading}
        >
          <Text style={tw`text-white text-center font-bold`}>
            {bookingLoading ? t("loading") : "Book Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

