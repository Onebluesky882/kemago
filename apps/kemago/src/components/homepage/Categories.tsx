import { View, ScrollView, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { AppText } from "../AppText";

type CategoryProps = {
  id: string;
  name: string;
  emoji: string;
};

type Props = {
  categories: CategoryProps[];
};
const Categories = ({ categories }: Props) => {
  return (
    <View className="mt-9">
      <AppText className="mb-4 text-xl text-gray-900" weight="bold">
        Sports Categories
      </AppText>

      <FlashList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        renderItem={({ item }) => (
          <Pressable
            key={item.id}
            className="mr-3 items-center rounded-2xl bg-orange-50 px-4 py-4"
          >
            <AppText className="text-3xl">{item.emoji}</AppText>

            <AppText className="mt-2 text-xs text-gray-700">
              {item.name}
            </AppText>
          </Pressable>
        )}
      />
    </View>
  );
};

export default Categories;
