import React, { useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import PaymentModal from "./PaymentModal"; // Adjust path as needed
import { getCurrencyForCountry, formatCurrency, CurrencyCode, RegionCode } from "../utils/currency";
import type { PaymentInitParams } from "../services/paymentService";
import tw from "twrnc";

// --- User type ---
interface User {
  email: string;
  // Add more user fields as needed
}

// --- Props type ---
interface CheckoutScreenProps {
  user: User;
  total: number;
  region: RegionCode;
  language: string; // "en" | "pt"
}

// --- Main component ---
const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  user,
  total,
  region,
  language,
}) => {
  // Get region currency (e.g., "ZAR")
  const currency: CurrencyCode = getCurrencyForCountry(region);

  // Modal & payment params state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentParams, setPaymentParams] = useState<PaymentInitParams | null>(null);

  // --- Initiate payment (set params & show modal) ---
  const startPayment = () => {
    setPaymentParams({
      region,
      amount: total,
      email: user.email,
      currency,
    });
    setShowPayment(true);
  };

  // --- Success handler ---
  const handleSuccess = (data: any) => {
    setShowPayment(false);
    Alert.alert(
      language === "pt" ? "Sucesso" : "Success",
      language === "pt" ? "Pagamento concluído!" : "Payment successful!"
    );
    // TODO: Update order state or navigate if needed
  };

  // --- Close/cancel handler ---
  const handleClose = () => {
    setShowPayment(false);
    Alert.alert(
      language === "pt" ? "Cancelado" : "Cancelled",
      language === "pt"
        ? "Pagamento cancelado ou falhou."
        : "Payment cancelled or failed."
    );
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-white px-4`}>
      {/* Price display */}
      <View style={tw`mb-8 w-full items-center`}>
        <Text style={tw`text-2xl font-bold text-blue-800 mb-2`}>
          {language === "pt" ? "Total a pagar" : "Total to pay"}
        </Text>
        <Text style={tw`text-3xl font-bold`}>
          {formatCurrency(total, currency, language)}
        </Text>
      </View>

      {/* Pay Now button */}
      <TouchableOpacity
        style={tw`bg-blue-600 px-8 py-4 rounded-xl shadow-lg`}
        onPress={startPayment}
        disabled={showPayment}
      >
        <Text style={tw`text-white font-bold text-lg`}>
          {language === "pt" ? "Pagar Agora" : "Pay Now"}
        </Text>
      </TouchableOpacity>

      {/* Payment Modal */}
      {paymentParams && (
        <PaymentModal
          visible={showPayment}
          onClose={handleClose}
          params={paymentParams}
          onSuccess={handleSuccess}
        />
      )}
    </View>
  );
};

export default CheckoutScreen;
