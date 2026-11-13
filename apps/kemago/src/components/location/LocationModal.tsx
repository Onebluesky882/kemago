import { useLocation } from "@/hooks/useLocation";
import {
  Text,
  Modal,
  View,
  Button,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { LocationMap } from "./LocationMap";
import { useState } from "react";

const Location = ({
  openLocationModal,
}: {
  openLocationModal: (visible: boolean) => void;
}) => {
  const { location, loading, getCurrentLocation, address } = useLocation();
  const [visible, setVisible] = useState(true);
  console.log("visible", visible);

  const handleModelsClose = () => {
    setVisible(false);
    openLocationModal(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <Pressable
        className="  flex-1  justify-end bg-black/50  "
        onPress={handleModelsClose}
      >
        <View className="h-[60%] w-full   rounded-t-3xl  bg-background shadow p-5">
          <Text>Find Location</Text>

          <Button
            title="Get Current Location"
            onPress={getCurrentLocation}
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
      </Pressable>
    </Modal>
  );
};

export default Location;
