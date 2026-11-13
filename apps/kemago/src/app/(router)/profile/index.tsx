import {
  View,
  Text,
  Modal,
  Button,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocation } from "@/hooks/useLocation";

const index = () => {
  const { location, loading, getCurrentLocation, address } = useLocation();
  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Profile</Text>
      <Text>Find Location</Text>
      <Modal visible={true} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: "85%",

              padding: 24,

              borderRadius: 16,

              backgroundColor: "white",

              alignItems: "center",

              gap: 16,
            }}
          >
            <Text>Find Location</Text>

            {location?.latitude !== undefined && <Text></Text>}
            {loading && <ActivityIndicator />}
            {!loading && (
              <Button
                title="Get Current Location"
                onPress={getCurrentLocation}
                disabled={loading}
              />
            )}

            <Text>Latitude: {location?.latitude}</Text>

            <Text>Longitude: {location?.longitude}</Text>

            <Text>Country: {address?.country}</Text>

            <Text>Province: {address?.region}</Text>

            <Text>District: {address?.district}</Text>

            <Text>Subdistrict: {address?.subregion}</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default index;
