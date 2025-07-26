import Image from "next/image"

interface AvatarProps {
    src?: string
    size: number
    className?: string
}


export default function Avatar({src, size, className}: AvatarProps) {
    const avatarSrc = src || "/user-default.svg"
    return (
        <Image 
            src={avatarSrc}
            alt="Avatar"
            width={size}
            height={size}
            className={`rounded-full object-cover bg-gray-200 ${className}`}
        />
    )
}