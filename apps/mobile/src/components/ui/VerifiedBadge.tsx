import Svg, { Path } from "react-native-svg";
import { colors } from "../../theme/colors";

type VerifiedBadgeProps = {
  size?: number;
};

export function VerifiedBadge({ size = 14 }: VerifiedBadgeProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 14.7 4.3 18.2 3.8 19 7.3 22 9.2 20.4 12.5 22 15.8 19 17.7 18.2 21.2 14.7 20.7 12 23 9.3 20.7 5.8 21.2 5 17.7 2 15.8 3.6 12.5 2 9.2 5 7.3 5.8 3.8 9.3 4.3 12 2Z"
        fill={colors.brand}
      />
      <Path
        d="M8.5 12.3 10.8 14.6 15.5 9.6"
        stroke="#ffffff"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
