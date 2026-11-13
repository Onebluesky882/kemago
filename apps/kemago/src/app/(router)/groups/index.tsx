import { Text, ScrollView } from "react-native";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const index = () => {
  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Profile</Text>
    </ScrollView>
  );
};

export default index;
