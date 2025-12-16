import React from 'react';
import Svg, {Path, G, ClipPath, Defs, Rect} from 'react-native-svg';

const DatabaseIcon = ({size = 20, color = '#00FFB1'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <ClipPath id="clip-db">
        <Rect x="0" y="0" width="24" height="24" />
      </ClipPath>
    </Defs>
    <G clipPath="url(#clip-db)">
      <Path
        d="M12,9.429C18.154,9.429 23.143,7.51 23.143,5.143C23.143,2.776 18.154,0.857 12,0.857C5.846,0.857 0.857,2.776 0.857,5.143C0.857,7.51 5.846,9.429 12,9.429Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M0.857,5.143V18.857C0.857,21.223 5.846,23.143 12,23.143C18.154,23.143 23.143,21.223 23.143,18.857V5.143"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M23.143,12C23.143,14.366 18.154,16.286 12,16.286C5.846,16.286 0.857,14.366 0.857,12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  </Svg>
);

export default DatabaseIcon;
