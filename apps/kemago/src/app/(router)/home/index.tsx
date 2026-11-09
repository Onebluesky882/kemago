import { View, ScrollView, Pressable, Image } from "react-native";

import { AppText } from "@/components/AppText";
import { activities, categories, events, users } from "@/mock/homepage";
import EventComming from "@/components/homepage/EventComming";
import Greeting from "@/components/homepage/Greeting";
import ReelsNerby from "@/components/homepage/ReelsNerby";
import Search from "@/components/homepage/Search";
import Categories from "@/components/homepage/Categories";
import Activities from "@/components/homepage/Activities";
export default function HomeScreen() {
  return (
    <ScrollView className="  bg-[#FFFDF8]" showsVerticalScrollIndicator={false}>
      <View className="px-5   pb-10">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <AppText className="text-2xl text-sport-neon" weight="bold">
              KEMAGO.
            </AppText>
          </View>

          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-orange-100">
            <AppText className="text-xl">🔔</AppText>
          </Pressable>
        </View>

        {/* Greeting */}
        <Greeting />

        {/* reels nerby */}
        <ReelsNerby users={users} />

        {/* Search */}
        <Search />

        {/* Categories */}
        <Categories categories={categories} />

        {/* Activities */}
        <Activities activities={activities} />

        {/* Events */}
        <EventComming events={events} />

        {/* Bottom Message */}
        <View className="mt-10 items-center rounded-3xl bg-orange-100 p-6">
          <AppText className="text-2xl">💪</AppText>

          <AppText className="mt-2 text-lg text-gray-900" weight="bold">
            Better Together
          </AppText>

          <AppText className="mt-2 text-center text-sm text-gray-600">
            ออกกำลังกายกับเพื่อน สนุกกว่าออกกำลังกายคนเดียว
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
}
