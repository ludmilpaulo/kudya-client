declare module 'react-native-chat-ui' {
    export interface MessageType {
      id: string;
      author: string;
      text: string;
      createdAt: number;
      type: 'text';
    }
  
    export interface ChatProps {
      messages: MessageType[];
      onSendPress: (text: string) => void;
      user: { id: string };
      theme?: {
        colors?: {
          inputBackground?: string;
          userText?: string;
          userBubble?: string;
          defaultText?: string;
          defaultBubble?: string;
        };
        fonts?: {
          default?: string;
        };
      };
    }
  
    export const Chat: React.FC<ChatProps>;
  }
  