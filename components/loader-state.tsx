import { CircleCheck, Circle, LoaderCircle } from "lucide-react";

interface LoaderStateProps {
  brandProductDetailsComplete: boolean;
  audienceInsightsComplete: boolean;
  promptBuilt: boolean;
  imageGenerating: boolean;
  imageDataUrl: string | null;
}

export function LoaderState({
  brandProductDetailsComplete,
  audienceInsightsComplete,
  promptBuilt,
  imageGenerating,
  imageDataUrl,
}: LoaderStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col gap-4">
        <div
          className={`flex items-center gap-3 ${
            !brandProductDetailsComplete ? "animate-pulse" : ""
          }`}
        >
          {brandProductDetailsComplete ? (
            <CircleCheck className="size-5 text-green-500" />
          ) : (
            <LoaderCircle className="size-5 text-gray-400 animate-spin" />
          )}
          <span className="text-gray-300">
            Fetching brand & product details
          </span>
        </div>
        <div
          className={`flex items-center gap-3 ${
            brandProductDetailsComplete && !audienceInsightsComplete
              ? "animate-pulse"
              : ""
          }`}
        >
          {audienceInsightsComplete ? (
            <CircleCheck className="size-5 text-green-500" />
          ) : brandProductDetailsComplete ? (
            <LoaderCircle className="size-5 text-gray-400 animate-spin" />
          ) : (
            <Circle className="size-5 text-gray-600" />
          )}
          <span className="text-gray-300">
            Gathering audience insights
          </span>
        </div>
        <div
          className={`flex items-center gap-3 ${
            audienceInsightsComplete && !promptBuilt
              ? "animate-pulse"
              : ""
          }`}
        >
          {promptBuilt ? (
            <CircleCheck className="size-5 text-green-500" />
          ) : audienceInsightsComplete ? (
            <LoaderCircle className="size-5 text-gray-400 animate-spin" />
          ) : (
            <Circle className="size-5 text-gray-600" />
          )}
          <span className="text-gray-300">Building prompt</span>
        </div>
        <div
          className={`flex items-center gap-3 ${
            promptBuilt && imageGenerating ? "animate-pulse" : ""
          }`}
        >
          {!promptBuilt ? (
            <Circle className="size-5 text-gray-600" />
          ) : imageGenerating ? (
            <LoaderCircle className="size-5 text-gray-400 animate-spin" />
          ) : imageDataUrl ? (
            <CircleCheck className="size-5 text-green-500" />
          ) : (
            <Circle className="size-5 text-gray-600" />
          )}
          <span className="text-gray-300">Generating image</span>
        </div>
      </div>
    </div>
  );
}

