import { useState } from "react";
import { locationService } from "@/services/location.service";
import { Address } from "@/types/address";

export const useLocation = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);

  async function getCurrentLocation() {
    try {
      setLoading(true);

      const granted = await locationService.requestPermission();

      if (!granted) return;

      const position = await locationService.getCurrentPosition();

      setLocation(position);

      const addressResult = await locationService.getAddress(
        position.latitude,
        position.longitude,
      );
      setAddress(addressResult ?? null);
    } finally {
      setLoading(false);
    }
  }

  return {
    location,
    loading,
    address,
    getCurrentLocation,
  };
};
