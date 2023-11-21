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

const ChatComponent: React.FC<ChatComponentProps> = ({
  user,
  accessToken,
  orderId,
  userData,
  onClose, // Use the onClose prop here
  isChatModalVisible, 
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  //const [isChatModalVisible, setChatModalVisible] = useState(false);


  const handleClose = () => {
    console.log('Closing modal...'); // Add this line
    onClose(); // Use the onClose prop here
  };
  
  useEffect(() => {
    // Fetch chat messages from Django backend
    axios
      .get(`${apiUrl}/api/get_order_chat/${orderId}/`, {
       
      })
      .then((response) => {
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
      })
      .catch((error) => console.error('Error fetching chat messages:', error));
  }, [accessToken, orderId]);

  const onSend = (newMessages: IMessage[]) => {
    // Send new message to Django backend
    axios
      .post(`${apiUrl}/api/send_chat_message/`, {
        user_id:userData?.user_id,
        order_id: orderId,
        message: newMessages[0].text,
      })
      .then((response) => {
        // Update local messages state
        setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
      })
      .catch((error) => console.error('Error sending message:', error));
  };
  const chatHeight = messages.length * 60;

  return (
    <Modal
    visible={isChatModalVisible} // Use the isChatModalVisible state
    animationType="slide"
    onRequestClose={handleClose}
  >
        <View style={tailwind`flex-1 bg-white`}>
          <TouchableOpacity onPress={onClose} style={tailwind`absolute top-5 left-5 z-10`}>
            <Text style={tailwind`text-blue-500 font-bold`}>Fechar</Text>
          </TouchableOpacity>
    <View style={[tailwind`bg-white flex-1`, { height: chatHeight }]}>
      <GiftedChat
        placeholder={'Digite sua mensagem'}
       // label={'Enviar'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatComponent;