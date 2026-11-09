import { View, Text } from "react-native";
import React from "react";
import { AppText } from "../AppText";

const Greeting = () => {
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

        <AppText className="mt-1 text-sm text-orange-500">
          📍 Lampang, Thailand
        </AppText>
      </View>
    </View>
  );
};

export default Greeting;
