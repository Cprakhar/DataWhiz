import React, { useEffect, useRef } from 'react';
import {animate} from 'animejs';

const AnimeBouncingDots = ({ color = '#333', size = 12 }) => {
  const dotsRef = useRef([]);

  useEffect(() => {
    // Animate all dots as a group, but with a stagger for the effect
    animate(dotsRef.current, {
      translateY: [
        { value: -16, duration: 300 },
        { value: 0, duration: 300 }
      ],
      opacity: [
        { value: 0.2, duration: 300 },
        { value: 1, duration: 300 }
      ],
      delay: animate.s, // creates bouncing effect across dots
      loop: true,
      easing: 'easeInOutSine',
    });
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          ref={el => dotsRef.current[i] = el}
          style={{
            width: size,
            height: size,
            margin: '0 4px',
            borderRadius: '50%',
            background: color,
            display: 'inline-block'
          }}
        />
      ))}
    </div>
  );
};

export default AnimeBouncingDots;
