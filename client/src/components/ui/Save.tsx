import { useRef, useEffect } from "react";
import { animate, JSAnimation } from "animejs"; // adjust import as needed
import { Save } from "lucide-react";

interface SaveProps {
  loading: boolean
  className?: string
}

export default function SaveIcon({ loading, className }: SaveProps) {
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const animationRef = useRef<JSAnimation | null>(null);

  useEffect(() => {
    if (loading && iconRef.current) {
      // Start rotating around Y-axis (vertical axis)
      animationRef.current = animate(iconRef.current, {
        rotateY: '1turn', // 360deg
        duration: 1000,
        easing: 'linear',
        loop: true,
        autoplay: true,
      });
    } else if (!loading && animationRef.current) {
      // Reset rotation and stop animation
      animationRef.current.pause();
      if (iconRef.current) {
        animate(iconRef.current, {
          rotateY: '0turn',
          duration: 300,
          easing: 'easeOutCubic',
        });
      }
    }
    // Clean up on unmount
    return () => {
      if (animationRef.current) animationRef.current.pause();
    };
  }, [loading]);

  return (
    <span
      className={`${className}`}
      ref={iconRef}
      style={{
        display: 'inline-block',
        perspective: 600,
      }}
    >
      <Save />
    </span>
  );
}