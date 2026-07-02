import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import {
  useGetRideChatQuery,
  useSendRideChatMessageMutation,
} from '../../redux/api/ridesApi';
import type { RideChatMessage } from '../../services/rides/types';

type Props = {
  visible: boolean;
  rideId: number;
  driverName: string;
  onClose: () => void;
};

export default function RideChatModal({ visible, rideId, driverName, onClose }: Props) {
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<RideChatMessage>>(null);
  const { data: messages = [], isLoading, refetch } = useGetRideChatQuery(rideId, {
    skip: !visible,
    pollingInterval: visible ? 4000 : 0,
  });
  const [sendMessage, { isLoading: sending }] = useSendRideChatMessageMutation();

  useEffect(() => {
    if (visible) {
      void refetch();
    }
  }, [visible, refetch]);

  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    try {
      await sendMessage({ rideId, message: text }).unwrap();
      listRef.current?.scrollToEnd({ animated: true });
    } catch {
      setInput(text);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={tw`flex-1 bg-white`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={tw`pt-12 px-4 pb-3 border-b border-slate-100 flex-row items-center`}>
          <TouchableOpacity onPress={onClose} style={tw`mr-3 p-2`}>
            <Feather name="x" size={22} />
          </TouchableOpacity>
          <View style={tw`flex-1`}>
            <Text style={tw`text-lg font-bold text-slate-900`}>{driverName}</Text>
            <Text style={tw`text-xs text-slate-500`}>Ride chat</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator color="#2563EB" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={tw`p-4`}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const mine = item.senderType === 'client';
              return (
                <View style={tw`${mine ? 'items-end' : 'items-start'} mb-3`}>
                  <View
                    style={tw`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      mine ? 'bg-blue-600' : 'bg-slate-100'
                    }`}
                  >
                    <Text style={tw`${mine ? 'text-white' : 'text-slate-900'}`}>{item.message}</Text>
                  </View>
                  <Text style={tw`text-[10px] text-slate-400 mt-1`}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {item.status === 'read' ? ' · Read' : ''}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={tw`text-center text-slate-500 mt-8`}>Send a message to your driver</Text>
            }
          />
        )}

        <View style={tw`flex-row items-center px-4 pb-6 pt-2 border-t border-slate-100`}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            style={tw`flex-1 bg-slate-100 rounded-full px-4 py-3 mr-2`}
            multiline
          />
          <TouchableOpacity
            onPress={() => void onSend()}
            disabled={sending || !input.trim()}
            style={tw`w-11 h-11 rounded-full bg-blue-600 items-center justify-center ${!input.trim() ? 'opacity-50' : ''}`}
          >
            {sending ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="send" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
