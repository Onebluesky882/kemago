import * as Location from "expo-location";

export const locationService = {
  async requestPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission not granted");
      }
      return status;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      throw error;
    }
  },

  async getCurrentPosition() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission not granted");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      throw error;
    }
  },

  async getAddress(latitude: number, longitude: number) {
    const result = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    const address = result[0];

    if (!address) {
      throw new Error("No address found for the given coordinates");
    }

    return {
      country: address.country || null,
      region: address.region || null,
      district: address.district || null,
      subregion: address.subregion || null,
      city: address.city || null,
      postalCode: address.postalCode || null,
      street: address.street || null,
      name: address.name || null,
    };
  },
};
