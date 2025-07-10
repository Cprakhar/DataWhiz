import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus } from "lucide-react";

interface Props {
  onAdd: () => void;
}

export const EmptyState = ({ onAdd }: Props) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No connections configured</h3>
        <p className="text-muted-foreground mb-4">
          Add your first database connection to get started with DataWhiz.
        </p>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Connection
        </Button>
      </CardContent>
    </Card>
  );
}
