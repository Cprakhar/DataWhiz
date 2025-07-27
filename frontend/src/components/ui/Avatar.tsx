import Image from "next/image"

interface AvatarProps {
    src?: string
    size: number
    className?: string
}


export default function Avatar({src, size, className}: AvatarProps) {
    const avatarSrc = src || "/user-default.png"
    return (
        <Image 
            src={avatarSrc}
            width={size}
            height={size}
            alt="User avatar"
            className={`w-10 h-10 rounded-full object-cover mr-3 ${className}`}
        />
    )
}