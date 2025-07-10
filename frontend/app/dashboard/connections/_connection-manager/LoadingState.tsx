import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
        <h3 className="text-lg font-medium mb-2">Loading connections...</h3>
      </CardContent>
    </Card>
  );
}
