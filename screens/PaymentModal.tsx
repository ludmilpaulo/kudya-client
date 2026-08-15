import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { initializePayment, verifyPayment, type PaymentInitParams } from "../services/paymentService";
import type { RootState } from "../redux/store";
import type { PaymentInitializeResponse } from "../types/payments";

type PaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  params: PaymentInitParams;
  onSuccess: (data: { reference: string }) => void;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  params,
  onSuccess,
}) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentInitializeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (!visible || !token) return;
    setLoading(true);
    setPayment(null);
    setError(null);
    initializePayment(token, params)
      .then((res) => {
        setPayment(res);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load payment.");
        setLoading(false);
      });
  }, [visible, params, token]);

  const confirmWithServer = async () => {
    if (!token || !payment) return;
    setChecking(true);
    try {
      const verified = await verifyPayment(token, payment.kudya_reference || payment.provider_reference);
      if (verified.status === "paid" || verified.status === "completed") {
        onSuccess({ reference: verified.kudya_reference });
        onClose();
      } else {
        setError(verified.rejection_reason || `Payment is ${verified.status}. It is not marked paid until Kudya confirms with the provider.`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent hardwareAccelerated>
      <View style={tw`flex-1 bg-black/80 justify-center items-center`}>
        <View style={tw`bg-white w-11/12 rounded-2xl overflow-hidden`}>
          {loading ? (
            <View style={tw`p-8 items-center`}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={tw`mt-4 text-center`}>Starting payment...</Text>
            </View>
          ) : null}
          {error ? (
            <View style={tw`p-6`}>
              <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text>
              <TouchableOpacity onPress={onClose} style={tw`bg-gray-200 py-2 px-6 rounded-lg`}>
                <Text style={tw`text-center font-semibold`}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {payment?.authorization_url && !loading && !error ? (
            <WebView
              ref={webViewRef}
              source={{ uri: payment.authorization_url }}
              style={{ width: "100%", height: Platform.OS === "ios" ? 550 : 500 }}
              startInLoadingState
              javaScriptEnabled
              domStorageEnabled
            />
          ) : null}
          {payment && !payment.authorization_url && !loading && !error ? (
            <View style={tw`p-6`}>
              <Text style={tw`text-center mb-4`}>
                {payment.customer_message || "Confirm the payment on your phone, then tap below. Kudya only marks paid after the provider confirms."}
              </Text>
            </View>
          ) : null}
          {payment && !loading ? (
            <TouchableOpacity
              onPress={() => void confirmWithServer()}
              disabled={checking}
              style={tw`m-4 bg-blue-600 py-3 rounded-lg`}
            >
              <Text style={tw`text-center text-white font-semibold`}>
                {checking ? "Checking…" : "Check payment status"}
              </Text>
            </TouchableOpacity>
          ) : null}
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
