import { View, Text, Pressable } from "react-native";
import { AppText } from "../AppText";

type LocationProp = {
  city: string;
  country: string;
  onPress?: () => void;
};

const Greeting = ({ city, country, onPress }: LocationProp) => {
  const mockUser = "Risa";
  return (
    <View>
      <View className="mt-2">
        <AppText className="mt-1 text-base text-gray-500">
          วันนี้ไปออกกำลังกายดีไหม?
        </AppText>
      </View>
      <View className="flex  flex-row items-center justify-between  ">
        <AppText className=" pt-2 text-2xl text-gray-700" weight="text">
          Hi {mockUser}
        </AppText>
        <Pressable onPress={onPress}>
          <AppText className="mt-1 text-sm text-orange-500">
            📍 {city}, {country}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

export default Greeting;
