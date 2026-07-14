import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { colors } from "@/theme/colors";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: BarDatum[];
  height?: number;
}

export function BarChart({ data, height = 140 }: Props) {
  const max = Math.max(1, ...data.map((datum) => datum.value));
  const barWidth = data.length > 0 ? 100 / data.length : 0;

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 100 ${height}`}>
        {data.map((datum, index) => {
          const barHeight = (datum.value / max) * (height - 24);
          const x = index * barWidth + barWidth * 0.15;
          const width = barWidth * 0.7;
          return (
            <Rect
              key={datum.label}
              x={x}
              y={height - 24 - barHeight}
              width={width}
              height={barHeight}
              rx={2}
              fill={datum.color ?? colors.accent}
              opacity={0.85}
            />
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {data.map((datum) => (
          <Text key={datum.label} style={styles.label} numberOfLines={1}>
            {datum.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  label: {
    flex: 1,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 10,
  },
});
