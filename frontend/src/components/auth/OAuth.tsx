
import Button from "@/components/ui/Button";

import Image from "next/image";

type OAuthProps = {
  onGoogle: () => void;
  onGithub: () => void;
};

export default function OAuth({ onGoogle, onGithub }: OAuthProps) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        onClick={onGoogle}
        className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50 py-3"
      >
        <Image src="/google.svg" alt="Google" width={24} height={24} />
        <span className="font-medium">Continue with Google</span>
      </Button>
      <Button
        type="button"
        onClick={onGithub}
        className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50 py-3"
      >
        <Image src="/github.svg" alt="GitHub" width={22} height={22} />
        <span className="font-medium">Continue with Github</span>
      </Button>
    </div>
  );
}