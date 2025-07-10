import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getDatabaseColor } from "@/components/database/utils";
import { DatabaseType } from "@/components/database/types";

interface Props {
  value: DatabaseType;
  onChange: (type: DatabaseType) => void;
}

export const ConnectionTypeSelector = ({ value, onChange }: Props) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">Database Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="postgresql">
            <div className="flex items-center gap-2">
              <Badge className={getDatabaseColor("postgresql")}>PostgreSQL</Badge>
              <span>PostgreSQL</span>
            </div>
          </SelectItem>
          <SelectItem value="mysql">
            <div className="flex items-center gap-2">
              <Badge className={getDatabaseColor("mysql")}>MySQL</Badge>
              <span>MySQL</span>
            </div>
          </SelectItem>
          <SelectItem value="mongodb">
            <div className="flex items-center gap-2">
              <Badge className={getDatabaseColor("mongodb")}>MongoDB</Badge>
              <span>MongoDB</span>
            </div>
          </SelectItem>
          <SelectItem value="sqlite">
            <div className="flex items-center gap-2">
              <Badge className={getDatabaseColor("sqlite")}>SQLite</Badge>
              <span>SQLite</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
