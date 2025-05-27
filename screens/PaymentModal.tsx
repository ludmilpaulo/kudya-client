// components/PaymentModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { Modal, View, ActivityIndicator, TouchableOpacity, Text, Alert } from "react-native";
import { WebView } from "react-native-webview";
import tw from "twrnc";
import { fetchPaymentUrl, PaymentInitParams } from "../services/paymentService";

type PaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  params: PaymentInitParams;
  onSuccess: (data: any) => void;
};

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onClose, params, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setPaymentUrl(null);
      setError(null);
      fetchPaymentUrl(params)
        .then(res => {
          setPaymentUrl(res.payment_url);
          setLoading(false);
        })
        .catch(e => {
          setError(e.message);
          setLoading(false);
        });
    }
  }, [visible, params]);

  // Success detection - customize per provider
  const handleWebViewNavigationStateChange = (navState: any) => {
    // Example: Paystack/Multicaixa/Mpesa success redirects to certain url or includes 'success'
    if (navState.url.includes("success")) {
      onSuccess({ reference: navState.url });
      onClose();
    }
    // Optionally detect failure/cancel, etc.
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={tw`flex-1 bg-black/80 justify-center items-center`}>
        <View style={tw`bg-white w-11/12 rounded-2xl overflow-hidden`}>
          {loading && (
            <View style={tw`p-6 items-center`}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={tw`mt-4`}>Loading payment...</Text>
            </View>
          )}
          {error && (
            <View style={tw`p-6`}>
              <Text style={tw`text-red-500 mb-4`}>{error}</Text>
              <TouchableOpacity onPress={onClose} style={tw`bg-gray-200 py-2 px-6 rounded-lg`}>
                <Text style={tw`text-center`}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
          {paymentUrl && (
            <WebView
              ref={webViewRef}
              source={{ uri: paymentUrl }}
              style={{ width: "100%", height: 500 }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState
              renderLoading={() => <ActivityIndicator size="large" color="#2563eb" style={tw`mt-8`} />}
            />
          )}
          <TouchableOpacity onPress={onClose} style={tw`absolute top-2 right-2 z-10`}>
            <Text style={tw`text-xl text-gray-700`}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentModal;
