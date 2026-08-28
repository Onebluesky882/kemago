import type { ColorValue } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

type IconProps = {
  color: ColorValue;
  size?: number;
};

export function FeedIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 10.5 12 3l9 7.5" />
      <Path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </Svg>
  );
}

export function EventsIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9h18" />
      <Path d="M7 3v4M17 3v4" />
      <Path d="M4 5h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <Path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
    </Svg>
  );
}

export function ChatIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12a8 8 0 0 1-8 8H6l-3 3v-3.6A8 8 0 1 1 21 12Z" />
    </Svg>
  );
}

export function ProfileIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c1.4-4 4.7-6 8-6s6.6 2 8 6" />
    </Svg>
  );
}

export function JobsIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <Path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <Path d="M3 13h18" />
    </Svg>
  );
}

export function SportIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <Path d="M7 5H5a2 2 0 0 0 2 4" />
      <Path d="M17 5h2a2 2 0 0 1-2 4" />
      <Path d="M12 13v4" />
      <Path d="M9 20h6" />
    </Svg>
  );
}

export function ClubsIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="9" cy="8" r="3" />
      <Path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <Circle cx="17" cy="9" r="2.5" />
      <Path d="M15.5 14.2c2.7.5 4.5 2.8 4.5 5.8" />
    </Svg>
  );
}
