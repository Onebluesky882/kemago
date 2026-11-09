import { View, Pressable } from "react-native";
import { AppText } from "../AppText";
import { FlashList } from "@shopify/flash-list";

type EventProps = {
  id: string;
  title: string;
  location: string;
  time: string;
  people: string;
  emoji: string;
  host: string;
};

type Props = {
  events: EventProps[];
};

const EventComming = ({ events }: Props) => {
  return (
    <View className="mt-9">
      <View className="mb-4 flex-row items-center justify-between">
        <AppText className="text-xl text-gray-900" weight="bold">
          Events Coming
        </AppText>

        <Pressable>
          <AppText className="text-sm text-orange-500">ดูทั้งหมด →</AppText>
        </Pressable>
      </View>

      <FlashList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            key={item.id}
            className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5"
          >
            <View className="flex-row items-center">
              <View className="mr-4 h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
                <AppText className="text-3xl">{item.emoji}</AppText>
              </View>

              <View className="flex-1">
                <AppText className="text-lg text-gray-900" weight="bold">
                  {item.title}
                </AppText>

                <AppText className="mt-1 text-xs text-gray-500">
                  📍 {item.location}
                </AppText>

                <AppText className="mt-1 text-xs text-orange-500">
                  {item.time}
                </AppText>
              </View>
            </View>

            <View className="mt-5 flex-row items-center justify-between border-t border-gray-100 pt-4">
              <View>
                <AppText className="text-xs text-gray-500">
                  👥 {item.people}
                </AppText>

                <AppText className="mt-1 text-xs text-gray-400">
                  Host: {item.host}
                </AppText>
              </View>

              <Pressable className="rounded-full bg-orange-500 px-5 py-2.5">
                <AppText className="text-sm text-white" weight="bold">
                  เข้าร่วม
                </AppText>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default EventComming;
