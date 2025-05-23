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

  declare module 'expo-intl' {
  // Add only what you use for now:
  export function useTranslations(): (key: string) => string;
  export interface TranslationsProviderProps {
    translations: Record<string, Record<string, string>>;
    fallback: string;
    locale?: string | null;
    children: React.ReactNode;
  }
  export const TranslationsProvider: React.FC<TranslationsProviderProps>;
}
