import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { DreamScene } from "@/services/dreamVisualization/types";

interface Props {
  scene: DreamScene;
  size?: number;
}

export function DreamVisualization({ scene, size = 100 }: Props) {
  return (
    <View style={[styles.container, { aspectRatio: 1 }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={scene.gradient[0]} stopOpacity={0.55} />
            <Stop offset="1" stopColor={scene.gradient[1]} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={100} height={100} fill="url(#bg)" rx={6} />
        {scene.shapes.map((shape, index) => {
          const key = `${shape.type}-${index}`;
          if (shape.type === "streak") {
            return (
              <Rect
                key={key}
                x={shape.x}
                y={shape.y}
                width={shape.size}
                height={Math.max(1, shape.size / 12)}
                fill={shape.color}
                opacity={shape.opacity}
                rx={shape.size / 24}
                transform={`rotate(${shape.rotation} ${shape.x} ${shape.y})`}
              />
            );
          }
          if (shape.type === "spiral") {
            return (
              <Circle
                key={key}
                cx={shape.x}
                cy={shape.y}
                r={shape.size / 2}
                fill="none"
                stroke={shape.color}
                strokeWidth={1.5}
                opacity={shape.opacity}
              />
            );
          }
          return (
            <Circle
              key={key}
              cx={shape.x}
              cy={shape.y}
              r={shape.size / 2}
              fill={shape.color}
              opacity={shape.opacity}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
});
