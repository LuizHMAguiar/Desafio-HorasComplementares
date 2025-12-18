import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8 text-indigo-600">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}