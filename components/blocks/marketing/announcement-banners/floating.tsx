import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Floating() {
  return (
    <>
      {/* Container */}
      <div className="container mx-auto relative py-24 lg:py-32">
        {/* Floating Banner */}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8">
          <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-primary px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
            <p className="text-sm leading-6 text-primary-foreground">
              <strong className="font-semibold">Limited time offer</strong>
              <svg
                viewBox="0 0 2 2"
                className="mx-2 inline h-0.5 w-0.5 fill-current"
                aria-hidden="true"
              >
                <circle cx={1} cy={1} r={1} />
              </svg>
              Get 50% off for your first month
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center gap-x-1"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* End of Floating Banner */}
      </div>
      {/* End of Container */}
    </>
  );
}
