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
import type { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { initializePayment, verifyPayment, type PaymentInitParams } from "../services/paymentService";
import type { RootState } from "../redux/store";
import type { PaymentInitializeResponse } from "../types/payments";
import { useTranslation } from "../hooks/useTranslation";
import { isPaymentReturnUrl } from "../utils/paymentReturn";

type PaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  params: PaymentInitParams;
  onSuccess: (data: { reference: string }) => void;
};

const FAILED_STATUSES = new Set(["failed", "cancelled", "expired", "rejected"]);

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  params,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentInitializeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [returned, setReturned] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (!visible || !token) return;
    setLoading(true);
    setPayment(null);
    setError(null);
    setNotice(null);
    setReturned(false);
    initializePayment(token, params)
      .then((res) => {
        setPayment(res);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "The payment could not be started.");
        setLoading(false);
      });
  }, [visible, params, token]);

  const confirmWithServer = async () => {
    if (!token || !payment) return;
    setChecking(true);
    setNotice(null);
    try {
      const verified = await verifyPayment(token, payment.kudya_reference || payment.provider_reference);
      if (verified.status === "paid" || verified.status === "completed") {
        onSuccess({ reference: verified.kudya_reference });
        onClose();
      } else if (verified.raw_provider_status?.toUpperCase() === "AUTHORIZED") {
        setNotice(t("paymentAuthorizedHint"));
      } else if (FAILED_STATUSES.has(verified.status)) {
        setError(verified.rejection_reason || t("paymentNotConfirmed", undefined, { status: verified.status }));
      } else {
        setNotice(t("paymentNotConfirmed", undefined, { status: verified.status }));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("paymentVerifyFailed"));
    } finally {
      setChecking(false);
    }
  };

  const handleNavigation = (request: ShouldStartLoadRequest): boolean => {
    if (!isPaymentReturnUrl(request.url)) return true;
    if (!returned) {
      setReturned(true);
      void confirmWithServer();
    }
    return false;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent hardwareAccelerated>
      <View style={tw`flex-1 bg-black/80 justify-center items-center`}>
        <View style={tw`bg-white w-11/12 rounded-2xl overflow-hidden`}>
          {loading ? (
            <View style={tw`p-8 items-center`}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={tw`mt-4 text-center`}>{t("paymentStarting")}</Text>
            </View>
          ) : null}
          {error ? (
            <View style={tw`p-6`}>
              <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text>
              <TouchableOpacity onPress={onClose} style={tw`bg-gray-200 py-2 px-6 rounded-lg`}>
                <Text style={tw`text-center font-semibold`}>{t("paymentClose")}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {payment?.authorization_url && !loading && !error && !returned ? (
            <WebView
              ref={webViewRef}
              source={{ uri: payment.authorization_url }}
              style={{ width: "100%", height: Platform.OS === "ios" ? 550 : 500 }}
              onShouldStartLoadWithRequest={handleNavigation}
              startInLoadingState
              javaScriptEnabled
              domStorageEnabled
            />
          ) : null}
          {payment && (!payment.authorization_url || returned) && !loading && !error ? (
            <View style={tw`p-6`}>
              <Text style={tw`text-center mb-4`}>
                {returned ? t("paymentReturnHint") : payment.customer_message || t("paymentConfirmOnPhone")}
              </Text>
            </View>
          ) : null}
          {notice && !error ? <Text style={tw`px-6 text-center text-amber-700`}>{notice}</Text> : null}
          {payment && !loading ? (
            <TouchableOpacity
              onPress={() => void confirmWithServer()}
              disabled={checking}
              style={tw`m-4 bg-blue-600 py-3 rounded-lg`}
            >
              <Text style={tw`text-center text-white font-semibold`}>
                {checking ? t("paymentChecking") : t("paymentCheckStatus")}
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
