import { Circle } from "lucide-react";

interface Props {
  connected: boolean;
}

export function ConnectionStatus({ connected }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Circle
        className={`h-2 w-2 fill-current ${connected ? "text-green-500" : "text-gray-400"}`}
      />
      <span className="text-sm">{connected ? "Connected" : "Disconnected"}</span>
    </div>
  );
}
