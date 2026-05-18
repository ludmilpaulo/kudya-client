// Add this at the top of the file or in a separate AudioPlayer.tsx
import { Audio } from "expo-av";
import { useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import tw from "twrnc";

const RNText = Text as any;
interface AudioPlayerProps {
  uri: string;
  isUser: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ uri, isUser }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const play = async () => {
    if (sound) {
      await sound.replayAsync();
      return;
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    setSound(newSound);
    await newSound.playAsync();
  };

  return (
    <TouchableOpacity onPress={play} style={tw`${isUser ? "mt-1" : "ml-1 mt-1"}`}>
      <RNText style={tw`${isUser ? "text-white" : "text-black"} text-sm`}>▶ Voice Note</RNText>
    </TouchableOpacity>
  );
};

export default AudioPlayer;
