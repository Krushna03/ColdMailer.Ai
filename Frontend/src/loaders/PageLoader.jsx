import { Loader2 } from "lucide-react";

export default function PageLoader({ className = "" }) {
  return (
    <div className={`flex h-screen w-full items-center justify-center bg-black ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-brand-200" />
    </div>
  );
}
