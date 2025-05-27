import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import PaymentModal from './PaymentModal'; // Adjust path
import tw from 'twrnc';

export default function CheckoutScreen({ user, total, region, language, currency }) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | undefined>();
  const [paystackKey, setPaystackKey] = useState<string | undefined>("pk_test_xxxx"); // Replace with real public key

  const startPayment = async () => {
    if (region === "ZA") {
      setShowPayment(true);
    } else {
      // --- Get payment URL from your backend (adjust endpoint/logic)
      try {
        const res = await fetch(`https://your-backend/api/pay/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            region, amount: total, email: user.email, currency,
            // add other metadata as required by your backend
          }),
        });
        const data = await res.json();
        if (data.paymentUrl) {
          setPaymentUrl(data.paymentUrl);
          setShowPayment(true);
        } else {
          Alert.alert(language === "pt" ? "Erro" : "Error", language === "pt" ? "Falha ao iniciar o pagamento" : "Failed to initiate payment");
        }
      } catch (e) {
        Alert.alert(language === "pt" ? "Erro" : "Error", language === "pt" ? "Falha ao iniciar o pagamento" : "Failed to initiate payment");
      }
    }
  };

  const handleSuccess = () => {
    setShowPayment(false);
    Alert.alert(language === "pt" ? "Sucesso" : "Success", language === "pt" ? "Pagamento concluído!" : "Payment successful!");
    // Complete order logic...
  };
  const handleError = () => {
    setShowPayment(false);
    Alert.alert(language === "pt" ? "Cancelado" : "Cancelled", language === "pt" ? "Pagamento cancelado ou falhou." : "Payment cancelled or failed.");
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-white`}>
      <TouchableOpacity
        style={tw`bg-blue-600 px-6 py-3 rounded-xl`}
        onPress={startPayment}
      >
        <Text style={tw`text-white font-bold text-lg`}>
          {language === "pt" ? "Pagar Agora" : "Pay Now"}
        </Text>
      </TouchableOpacity>
      <PaymentModal
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        region={region}
        amount={total}
        email={user.email}
        paymentUrl={paymentUrl}
        paystackPublicKey={paystackKey}
        onSuccess={handleSuccess}
        onError={handleError}
        language={language}
        currency={currency}
      />
    </View>
  );
}
