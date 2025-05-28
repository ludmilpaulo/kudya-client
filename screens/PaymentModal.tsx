import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform
} from "react-native";
import { WebView } from "react-native-webview";
import tw from "twrnc";
import { fetchPaymentUrl, PaymentInitParams } from "../services/paymentService";

type PaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  params: PaymentInitParams;
  onSuccess: (data: any) => void;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  params,
  onSuccess,
}) => {
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
        .then((res) => {
          setPaymentUrl(res.payment_url);
          setLoading(false);
        })
        .catch((e) => {
          setError(e.message || "Failed to load payment.");
          setLoading(false);
        });
    }
  }, [visible, params]);

  // Detect payment success via URL
  const handleWebViewNavigationStateChange = (navState: any) => {
    const successKeywords = ["success", "paid", "completed"];
    if (successKeywords.some((k) => navState.url.toLowerCase().includes(k))) {
      onSuccess({ reference: navState.url });
      onClose();
    }
    // Optional: detect cancel/fail, etc.
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
      hardwareAccelerated
    >
      <View style={tw`flex-1 bg-black/80 justify-center items-center`}>
        <View style={tw`bg-white w-11/12 rounded-2xl overflow-hidden`}>
          {/* Loading */}
          {loading && (
            <View style={tw`p-8 items-center`}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={tw`mt-4 text-center`}>Loading payment...</Text>
            </View>
          )}
          {/* Error */}
          {error && (
            <View style={tw`p-6`}>
              <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text>
              <TouchableOpacity
                onPress={onClose}
                style={tw`bg-gray-200 py-2 px-6 rounded-lg`}
              >
                <Text style={tw`text-center font-semibold`}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Payment WebView */}
          {paymentUrl && !loading && !error && (
            <WebView
              ref={webViewRef}
              source={{ uri: paymentUrl }}
              style={{ width: "100%", height: Platform.OS === "ios" ? 550 : 500 }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState
              renderLoading={() => (
                <ActivityIndicator size="large" color="#2563eb" style={tw`mt-8`} />
              )}
              javaScriptEnabled
              domStorageEnabled
            />
          )}
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={tw`absolute top-2 right-2 z-10 bg-gray-200 rounded-full w-8 h-8 items-center justify-center`}
          >
            <Text style={tw`text-xl text-gray-700`}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentModal;
