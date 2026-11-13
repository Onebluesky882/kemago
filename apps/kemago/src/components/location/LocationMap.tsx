import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

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
