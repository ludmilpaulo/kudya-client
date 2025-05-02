import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import LinearGradient  from 'expo-linear-gradient';
import { useAppSelector } from '../redux/store';
import { selectUser } from '../redux/slices/authSlice';
import { baseAPI } from '../services/types';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';

type OrderDetail = {
  meal: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
  sub_total: number;
};

type Order = {
  id: number;
  restaurant: {
    id: number;
    name: string;
    phone: string;
    address: string;
  };
  customer: {
    id: number;
    name: string;
    avatar: string;
    phone: string;
    address: string;
  };
  total: number;
  picked_at: string;
  status: string;
  invoice_pdf: string;
  order_details: OrderDetail[];
};

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const token = user.token;
        if (!token) {
          console.error("Access token not found");
          return;
        }
        const response = await axios.post(`${baseAPI}/customer/customer/order/history/`, {
          access_token: token,
        });
        setOrders(response.data.order_history);
      } catch (error) {
        console.error("Error fetching order history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user.token]);

  const handleDownloadPDF = async (url: string) => {
    try {
      if (FileSystem.documentDirectory) {
        const fileUri = FileSystem.documentDirectory + url.split('/').pop();
        const downloadResult = await FileSystem.downloadAsync(url, fileUri);
        Alert.alert('Download concluído', 'O arquivo foi baixado com sucesso.', [
          { text: 'Abrir', onPress: () => Linking.openURL(downloadResult.uri) },
          { text: 'Fechar' }
        ]);
      } else {
        Alert.alert('Erro de Download', 'Diretório do sistema de arquivos não disponível.');
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert('Erro de Download', 'Não foi possível baixar o arquivo.');
    }
  };

  return (
    <LinearGradient colors={['#FCD34D', '#3B82F6']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico de Pedidos</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Image source={{ uri: order.customer.avatar }} style={styles.avatar} />
                <View>
                  <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
                  <Text style={styles.orderDate}>{new Date(order.picked_at).toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.totalText}>Total: {order.total} Kz</Text>
                <Text style={[styles.statusText, order.status === 'Entregue' ? styles.statusDelivered : styles.statusPending]}>
                  {order.status}
                </Text>
                <TouchableOpacity onPress={() => handleDownloadPDF(order.invoice_pdf)} style={styles.invoiceButton}>
                  <Text style={styles.invoiceButtonText}>Baixar Fatura</Text>
                </TouchableOpacity>
                <Text style={styles.orderDetailsTitle}>Detalhes do Pedido</Text>
                <View style={styles.orderDetailsList}>
                  {order.order_details.map((detail, index) => (
                    <Text key={index} style={styles.orderDetailItem}>
                      {detail.meal.name} - {detail.quantity} x {detail.sub_total}Kz
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    color: '#666',
  },
  orderDetails: {
    marginTop: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statusDelivered: {
    color: 'green',
  },
  statusPending: {
    color: 'red',
  },
  invoiceButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  invoiceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  orderDetailsList: {
    marginTop: 8,
  },
  orderDetailItem: {
    color: '#666',
  },
});

export default OrderHistory;
