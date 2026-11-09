import { View, ScrollView, Pressable, Image } from "react-native";

import { AppText } from "@/components/AppText";

const categories = [
  { id: "1", name: "วิ่ง", emoji: "🏃" },
  { id: "2", name: "ปั่นจักรยาน", emoji: "🚴" },
  { id: "3", name: "ฟิตเนส", emoji: "🏋️" },
  { id: "4", name: "โยคะ", emoji: "🧘" },
  { id: "5", name: "แบดมินตัน", emoji: "🏸" },
];

const activities = [
  {
    id: "1",
    title: "Evening Running",
    location: "สวนสาธารณะเขลางค์",
    time: "วันนี้ · 17:30",
    people: "4/6 คน",
    emoji: "🏃",
    host: "Natt",
  },
  {
    id: "2",
    title: "Morning Cycling",
    location: "กาดกองต้า",
    time: "พรุ่งนี้ · 06:00",
    people: "5/8 คน",
    emoji: "🚴",
    host: "Beam",
  },
];

const users = [
  {
    id: "1",
    name: "Natt",
    avatar: "https://i.pravatar.cc/150?img=12",
    activity: "Running",
    distance: "1.2 km",
  },
  {
    id: "2",
    name: "Beam",
    avatar: "https://i.pravatar.cc/150?img=47",
    activity: "Fitness",
    distance: "2.5 km",
  },
  {
    id: "3",
    name: "Ton",
    avatar: "https://i.pravatar.cc/150?img=11",
    activity: "Cycling",
    distance: "3 km",
  },
];

const events = [
  {
    id: "1",
    title: "Yoga Workshop",
    location: "สตูดิโอโยคะลำปาง",
    time: "เสาร์นี้ · 10:00",
    people: "10/15 คน",
    emoji: "🧘",
    host: "Ploy",
  },
  {
    id: "2",
    title: "Badminton Tournament",
    location: "สนามแบดมินตันลำปาง",
    time: "อาทิตย์นี้ · 14:00",
    people: "6/12 คน",
    emoji: "🏸",
    host: "Mark",
  },
];
export default function HomeScreen() {
  const mockUser = "Risa";
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

        {/* Find Friends */}
        <View className="mt-6">
          <View className="mb-4 flex-row items-center justify-between">
            <AppText className="text-xl text-gray-900" weight="bold">
              Reels
            </AppText>

            <Pressable>
              <AppText className="text-sm text-orange-500">ดูทั้งหมด →</AppText>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {users.map((user) => (
              <View
                key={user.id}
                className="mr-3 w-40 items-center rounded-3xl border border-gray-100 bg-white p-4"
              >
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
            ))}
          </ScrollView>
        </View>

        {/* Search */}
        <Pressable className="mt-6 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-4">
          <AppText className="mr-3 text-lg">🔍</AppText>
          <AppText className="text-sm text-gray-400">
            ค้นหาเพื่อน กิจกรรม สถานที่...
          </AppText>
        </Pressable>

        {/* Categories */}
        <View className="mt-9">
          <AppText className="mb-4 text-xl text-gray-900" weight="bold">
            Sports Categories
          </AppText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((item) => (
              <Pressable
                key={item.id}
                className="mr-3 items-center rounded-2xl bg-orange-50 px-4 py-4"
              >
                <AppText className="text-3xl">{item.emoji}</AppText>

                <AppText className="mt-2 text-xs text-gray-700">
                  {item.name}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Activities */}
        <View className="mt-9">
          <View className="mb-4 flex-row items-center justify-between">
            <AppText className="text-xl text-gray-900" weight="bold">
              Group Activities
            </AppText>

            <Pressable>
              <AppText className="text-sm text-orange-500">ดูทั้งหมด →</AppText>
            </Pressable>
          </View>

          {activities.map((item) => (
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
          ))}
        </View>

        {/* events comming */}
        <View className="mt-9">
          <View className="mb-4 flex-row items-center justify-between">
            <AppText className="text-xl text-gray-900" weight="bold">
              Events Coming
            </AppText>

            <Pressable>
              <AppText className="text-sm text-orange-500">ดูทั้งหมด →</AppText>
            </Pressable>
          </View>

          {events.map((item) => (
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
          ))}
        </View>

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
