import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import axios from 'axios';
import { baseAPI } from '../services/types';
import tw from 'twrnc';

interface ChatComponentProps {
  user: 'customer' | 'driver';
  accessToken: string;
  orderId: number;
  userData: any;
  onClose: () => void;
  isChatModalVisible: boolean;
}

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
        const response = await axios.get(`${baseAPI}/info/get_order_chat/${orderId}/`);
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
  }, [orderId]);

  const onSend = (newMessages: IMessage[]) => {
    axios
      .post(`${baseAPI}/info/send_chat_message/`, {
        user_id: userData?.user_id,
        order_id: orderId,
        message: newMessages[0].text,
      })
      .then(() => {
        setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
      })
      .catch((error) => console.error('Error sending message:', error));
  };

  return (
    <Modal visible={isChatModalVisible} animationType="slide" onRequestClose={handleClose}>
      <View style={tw`flex-1 bg-white`}>
        <TouchableOpacity onPress={handleClose} style={tw`absolute top-5 left-5 z-10`}>
          <Text style={tw`text-blue-500 font-bold`}>Fechar</Text>
        </TouchableOpacity>

        <View style={tw`flex-1 pt-16`}>
          <GiftedChat
            placeholder="Digite sua mensagem"
            messages={messages}
            onSend={(newMessages) => onSend(newMessages)}
            user={{
              _id: userData?.user_id,
            }}
            alwaysShowSend
            renderAvatarOnTop
          />
        </View>
      </View>
    </Modal>
  );
};

export default ChatComponent;
