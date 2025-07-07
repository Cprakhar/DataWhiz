import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TestTubeDiagonal, CheckCircle, XCircle, Info } from "lucide-react";
import { TestStatus } from "@/components/database/types";

interface Props {
  testStatus: TestStatus;
  testError: string;
  onTest: () => void;
  disabled: boolean;
}

export function TestConnectionSection({ testStatus, testError, onTest, disabled }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Test Connection</h3>
        <Button
          type="button"
          variant="outline"
          onClick={onTest}
          disabled={disabled}
          className="flex items-center gap-2 bg-transparent"
        >
          {testStatus === "testing" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TestTubeDiagonal className="h-4 w-4" />
          )}
          {testStatus === "testing" ? "Testing..." : "Test Connection"}
        </Button>
      </div>
      {testStatus === "success" && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Connection successful! The database is reachable and credentials are valid.
          </AlertDescription>
        </Alert>
      )}
      {testStatus === "error" && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Connection failed:</strong> {testError}
          </AlertDescription>
        </Alert>
      )}
      {testStatus === "idle" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please test your connection before saving to ensure it works correctly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
