import React from "react";
import { View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { colors } from "@/theme/colors";

interface Props {
  values: number[];
  minValue?: number;
  maxValue?: number;
  height?: number;
  color?: string;
}

export function LineChart({
  values,
  minValue = 1,
  maxValue = 5,
  height = 100,
  color = colors.accentAlt,
}: Props) {
  if (values.length === 0) {
    return <View style={{ height }} />;
  }

  const range = Math.max(1, maxValue - minValue);
  const stepX = values.length > 1 ? 100 / (values.length - 1) : 0;
  const points = values
    .map((value, index) => {
      const x = values.length > 1 ? index * stepX : 50;
      const normalized = (value - minValue) / range;
      const y = height - 12 - normalized * (height - 24);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Svg width="100%" height={height} viewBox={`0 0 100 ${height}`}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {values.map((value, index) => {
        const x = values.length > 1 ? index * stepX : 50;
        const normalized = (value - minValue) / range;
        const y = height - 12 - normalized * (height - 24);
        return <Circle key={index} cx={x} cy={y} r={2} fill={color} />;
      })}
    </Svg>
  );
}
