
"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "@/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Alert variant="destructive" className="max-w-lg text-center">
         <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12" />
        </div>
        <AlertTitle className="text-2xl font-bold">Something went wrong!</AlertTitle>
        <AlertDescription className="mt-2">
          <p>We're sorry, but an unexpected error occurred. Please try the action again.</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs bg-destructive/10 p-2 rounded-md">
            <code>{error.message}</code>
          </pre>
        </AlertDescription>
        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </Alert>
    </div>
  );
}
