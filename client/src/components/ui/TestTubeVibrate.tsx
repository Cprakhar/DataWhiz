import React, { useEffect, useRef } from 'react';
import { TestTube2 } from 'lucide-react';
import { animate } from 'animejs';

interface TestTubeProps {
  wiggle: boolean
  className: string
}

export default function TestTube({wiggle, className}: TestTubeProps) {
  const iconRef = useRef(null);

  useEffect(() => {
    if (wiggle && iconRef.current) {
      // Start wiggle animation
      const animation = animate(iconRef.current, {
        rotate: [
          { to: 15, duration: 60, easing: 'easeInOutSine' },
          { to: -15, duration: 120, easing: 'easeInOutSine' },
          { to: 10, duration: 60, easing: 'easeInOutSine' },
          { to: -10, duration: 100, easing: 'easeInOutSine' },
          { to: 0, duration: 60, easing: 'easeInOutSine' },
        ],
        loop: true,
        direction: 'alternate',
        duration: 400,
      });
      return () => {
        animation.pause(); // Cleanup on unmount/state change
      }
    }
  }, [wiggle]);

  return (
    <span ref={iconRef} style={{ display: 'inline-block' }} className={`${className}`}>
      <TestTube2 />
    </span>
  );
};
