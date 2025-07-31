import { animate, JSAnimation } from "animejs"
import { Sparkle as Spkle } from "lucide-react"
import { useEffect, useRef } from "react"

interface SparkleProps {
  className?: string;
  loading: boolean;
}

const Sparkle = ({loading, className}: SparkleProps) => {
  const sparkleRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let animation : JSAnimation
    if (sparkleRef.current && loading) {
      animation = animate(sparkleRef.current, {
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 750,
        easing: "easeInOutQuad",
        loop: true,
        direction: "alternate",   
      })
    } else if (sparkleRef.current) {
      animate(sparkleRef.current, {
        opacity: 1,
        scale: 1,
        duration: 200,
        easing: "easeInOutQuad",
        loop: false,
      })
    }
    return () => {
      if (animation) animation.pause()
    }
  }, [loading])
  
  return (
    <span ref={sparkleRef} className="inline-block">
      <Spkle className={`w-4 h-4 ${className}`} />
    </span>
  )
}

export default Sparkle;