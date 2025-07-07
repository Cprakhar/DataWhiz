import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { databaseInfo } from "./utils";
import { DatabaseType } from "@/components/database/types";

interface Props {
  dbType: DatabaseType;
}

export function InfoCard({ dbType }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          About {dbType.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{databaseInfo[dbType].description}</p>
      </CardContent>
    </Card>
  );
}
