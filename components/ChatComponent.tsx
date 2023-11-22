import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import axios from 'axios';
import { apiUrl } from '../configs/variable';
import tailwind from "tailwind-react-native-classnames"; 
interface ChatComponentProps {
  user: 'customer' | 'driver';
  accessToken: string;
  orderId: number;
  userData: any;
  onClose: () => void; // Define the onClose prop as a function
  isChatModalVisible: boolean; 

 // Add isChatModalVisible as a prop
  
}

// ... (other imports)

const ChatComponent: React.FC<ChatComponentProps> = ({
  user,
  accessToken,
  orderId,
  userData,
  onClose,
  isChatModalVisible,
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/get_order_chat/${orderId}/`);
        const chatMessages = response.data;
        const formattedMessages = chatMessages.map((chatMessage: any) => ({
          _id: chatMessage.id,
          text: chatMessage.message,
          createdAt: new Date(chatMessage.timestamp),
          user: {
            _id: chatMessage.sender,
            name: chatMessage.sender.username,
          },
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };

    fetchMessages();
  }, [orderId, messages]); // Include messages in the dependency array

  const onSend = (newMessages: IMessage[]) => {
    axios
      .post(`${apiUrl}/api/send_chat_message/`, {
        user_id: userData?.user_id,
        order_id: orderId,
        message: newMessages[0].text,
      })
      .then((response) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...newMessages[0],
            _id: String(new Date().getTime()),
          },
        ]);
      })
      .catch((error) => console.error('Error sending message:', error));
  };

  const chatHeight = messages.length * 60;

  return (
    <Modal visible={isChatModalVisible} animationType="slide" onRequestClose={handleClose}>
      <View style={tailwind`flex-1 bg-white`}>
        <TouchableOpacity onPress={onClose} style={tailwind`absolute top-5 left-5 z-10`}>
          <Text style={tailwind`text-blue-500 font-bold`}>Fechar</Text>
        </TouchableOpacity>
        <View style={[tailwind`bg-white flex-1`, { height: chatHeight }]}>
          <GiftedChat
            placeholder={'Digite sua mensagem'}
            messages={messages}
            onSend={(newMessages) => onSend(newMessages)}
            user={{
              _id: userData?.user_id,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ChatComponent;
