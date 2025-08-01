import { useState } from "react";

interface TruncateProps {
  value: string;
  maxLength?: number;
}


const TruncatedValue = ({ value, maxLength = 80 }: TruncateProps) => {
  const [expanded, setExpanded] = useState(false);
  const displayValue = expanded || value.length <= maxLength ? value : value.slice(0, maxLength) + '...';
  return (
    <span
      className="cursor-pointer select-text break-all"
      title={expanded ? '' : value}
      onDoubleClick={() => setExpanded((e) => !e)}
    >
      {displayValue}
    </span>
  );
};

export default TruncatedValue;