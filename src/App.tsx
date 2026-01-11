import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import FeedbackWidget from "./packages/feedback-widget";

const COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
];

function Cube({ color }: { color: string }) {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function App() {
  const [cubeColor, setCubeColor] = useState(COLORS[0].value);

  return (
    <div className="flex h-screen w-screen">
      {/* Canvas - Left side */}
      <div className="flex-1 bg-zinc-900">
        <Canvas frameloop="demand" camera={{ position: [4, 3, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Cube color={cubeColor} />
          <OrbitControls />
        </Canvas>
      </div>

      {/* Sidepanel - Right side */}
      <div className="w-64 border-l border-zinc-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Settings</h2>

        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-700">Cube Color</h3>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setCubeColor(color.value)}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  cubeColor === color.value ? "border-zinc-900" : "border-transparent"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
      <FeedbackWidget />
    </div>
  );
}

export default App;
