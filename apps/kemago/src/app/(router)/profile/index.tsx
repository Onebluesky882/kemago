import {
  View,
  Text,
  Modal,
  Button,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocation } from "@/hooks/useLocation";

const index = () => {
  const { location, loading, getCurrentLocation, address } = useLocation();

  const helperClick = () => {
    console.log("click");
    getCurrentLocation();
  };
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
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-[90%] rounded-2xl bg-white p-5">
            <Text>Find Location</Text>

            <Button
              title="Get Current Location"
              onPress={helperClick}
              disabled={loading}
            />

            {loading && <ActivityIndicator size="large" />}

            {location && (
              <>
                <LocationMap
                  latitude={location.latitude}
                  longitude={location.longitude}
                  title="My Location"
                  description={address?.district ?? ""}
                  latitudeDelta={0}
                  longitudeDelta={0}
                />

                <View>
                  <Text>Province: {address?.city ?? "-"}</Text>
                  <Text>District: {address?.district ?? "-"}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

type LocationMapProps = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  title?: string;
  description?: string;
};
export const LocationMap = ({
  latitude,
  longitude,
  title,
  description,
}: LocationMapProps) => {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      onLayout={(event) => {
        console.log("Map Container Layout:", event.nativeEvent.layout);
      }}
      style={{ width: "100%", height: 250 }}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onMapReady={() => console.log("Google Map Ready")}
      onMapLoaded={() => console.log("Google Map Loaded")}
    >
      <Marker
        coordinate={{
          latitude,
          longitude,
        }}
        title={title}
        description={description}
      />
    </MapView>
  );
};
export default index;
