import { Pressable } from "react-native";
import { AppText } from "../AppText";

const Search = () => {
  return (
    <Pressable className="mt-6 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-4">
      <AppText className="mr-3 text-lg">🔍</AppText>
      <AppText className="text-sm text-gray-400">
        ค้นหาเพื่อน กิจกรรม สถานที่...
      </AppText>
    </Pressable>
  );
};

export default Search;
