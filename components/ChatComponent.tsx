import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { baseAPI } from "../services/types";
import tw from "twrnc";

interface ChatComponentProps {
  user: "customer" | "driver";
  accessToken: string;
  orderId: number;
  userData: {
    user_id: string;
    username: string;
  };
  isChatModalVisible: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text?: string;
  audioUri?: string;
  senderId: string;
  senderName: string;
  timestamp: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  user,
  accessToken,
  orderId,
  userData,
  isChatModalVisible,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const currentUserId = userData.user_id;

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${baseAPI}/info/get_order_chat/${orderId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const formatted: Message[] = response.data.map((msg: any) => ({
        id: msg.id.toString(),
        text: msg.message || undefined,
        audioUri: msg.audio || undefined,
        senderId: msg.sender.id.toString(),
        senderName: msg.sender.username,
        timestamp: msg.timestamp,
      }));

      setMessages(formatted.reverse());
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      senderId: currentUserId,
      senderName: userData.username,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [tempMessage, ...prev]);
    setInput("");

    try {
      await axios.post(
        `${baseAPI}/info/send_chat_message/`,
        {
          user_id: currentUserId,
          order_id: orderId,
          message: tempMessage.text,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to send text message", error);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      await sendVoiceNote(uri);
    }
  };

  const sendVoiceNote = async (uri: string) => {
    const formData = new FormData();
    formData.append("user_id", currentUserId);
    formData.append("order_id", orderId.toString());
    formData.append("voice_note", {
      uri,
      name: "voice_note.m4a",
      type: "audio/m4a",
    } as unknown as Blob);

    const tempMessage: Message = {
      id: Date.now().toString(),
      audioUri: uri,
      senderId: currentUserId,
      senderName: userData.username,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [tempMessage, ...prev]);

    try {
      await axios.post(`${baseAPI}/info/send_chat_voice/`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (err) {
      Alert.alert("Error", "Failed to upload voice note.");
      console.error("Upload error:", err);
    }
  };

  useEffect(() => {
    if (isChatModalVisible) {
      fetchMessages();
    }
  }, [isChatModalVisible]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setIsTyping(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setIsTyping(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.senderId === currentUserId;
    const bubbleStyle = isUser
      ? tw`bg-blue-500 self-end`
      : tw`bg-gray-200 self-start flex-row`;

    const textColor = isUser ? "text-white" : "text-gray-800";

    return (
      <View style={tw`flex-row mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${item.senderName}&background=random`,
            }}
            style={tw`w-8 h-8 rounded-full mr-2`}
          />
        )}
        <View style={[tw`max-w-[75%] px-4 py-2 rounded-2xl`, bubbleStyle]}>
          {item.text && <Text style={tw`${textColor} text-sm`}>{item.text}</Text>}
          {item.audioUri && (
            <AudioPlayer uri={item.audioUri} isUser={isUser} />
          )}
          <Text style={tw`${textColor} text-[10px] text-right mt-1`}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={tw`flex-1 bg-white`}
    >
      <View style={tw`flex-row justify-between items-center p-4 border-b border-gray-200`}>
        <TouchableOpacity onPress={onClose}>
          <Text style={tw`text-blue-500 text-base font-bold`}>Close</Text>
        </TouchableOpacity>
        <Text style={tw`text-lg font-semibold text-gray-800`}>Order Chat</Text>
        <View style={tw`w-12`} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`p-4 pb-2`}
        inverted
      />

      {isTyping && (
        <View style={tw`px-4 pb-1`}>
          <Text style={tw`text-sm text-gray-500 italic`}>
            {user === "customer" ? "Driver is typing..." : "Customer is typing..."}
          </Text>
        </View>
      )}

      <View style={tw`flex-row items-center px-4 py-2 border-t border-gray-200 bg-white`}>
        <TextInput
          placeholder="Type a message"
          value={input}
          onChangeText={setInput}
          style={tw`flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm`}
          placeholderTextColor="#999"
        />
        {input ? (
          <TouchableOpacity onPress={handleSend} style={tw`ml-2`}>
            <Text style={tw`text-blue-500 font-bold text-sm`}>Send</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={tw`ml-2 bg-blue-500 p-3 rounded-full`}
          >
            <Text style={tw`text-white font-bold`}>🎙️</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatComponent;
