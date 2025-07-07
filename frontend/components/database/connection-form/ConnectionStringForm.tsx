import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { databaseInfo } from "./utils";
import { DatabaseType } from "@/components/database/types";

interface Props {
  dbType: DatabaseType;
  value: string;
  onChange: (val: string) => void;
  name: string;
  setName: (val: string) => void;
}

export function ConnectionStringForm({ dbType, value, onChange, name, setName }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Connection Name</Label>
        <Input
          id="name"
          placeholder="My Database Connection"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="connectionString">Connection String</Label>
        <Textarea
          id="connectionString"
          placeholder={databaseInfo[dbType].examples[0]}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">Enter the full connection string for your database</p>
      </div>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Examples for {dbType.toUpperCase()}:</strong>
          <ul className="mt-2 space-y-1">
            {databaseInfo[dbType].examples.map((example, index) => (
              <li key={index} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {example}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
