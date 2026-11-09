import { View, Image, Pressable, ScrollView } from "react-native";
import { AppText } from "../AppText";
import { FlashList } from "@shopify/flash-list";

type UserProps = {
  id: string;
  name: string;
  avatar: string;
  activity: string;
  distance: string;
};
type Props = {
  users: UserProps[];
};
const ReelsNerby = ({ users }: Props) => {
  return (
    <View className=" mt-6">
      <View className="mb-4 flex-row items-center justify-between">
        <AppText className="text-xl text-gray-900" weight="bold">
          Reels
        </AppText>

        <Pressable>
          <AppText className="text-sm text-orange-500">ดูทั้งหมด →</AppText>
        </Pressable>
      </View>

      <FlashList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={users}
        renderItem={({ item: user }) => (
          <View className="mr-3 w-40 items-center rounded-3xl border border-gray-100 bg-white p-4">
            <Image
              source={{ uri: user.avatar }}
              className="h-20 w-20 rounded-full"
            />

            <AppText className="mt-3 text-base text-gray-900" weight="bold">
              {user.name}
            </AppText>

            <AppText className="mt-1 text-xs text-orange-500">
              {user.activity}
            </AppText>

            <AppText className="mt-1 text-xs text-gray-400">
              📍 {user.distance}
            </AppText>

            <Pressable className="mt-4 w-full rounded-full bg-orange-50 py-2">
              <AppText
                className="text-center text-xs text-orange-600"
                weight="bold"
              >
                ทักทาย
              </AppText>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
};

export default ReelsNerby;
