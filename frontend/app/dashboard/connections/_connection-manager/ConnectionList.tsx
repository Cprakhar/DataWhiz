import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DatabaseConnection } from "@/components/database/types";
import { ConnectionRow } from "./ConnectionRow";

interface Props {
  connections: DatabaseConnection[];
  onDelete: (id: string) => void;
}

export const ConnectionList = ({ connections, onDelete }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Connections</CardTitle>
        <CardDescription>
          {connections.length} connection{connections.length !== 1 ? "s" : ""} configured
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Connection Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Database</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Connected</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <ConnectionRow key={connection.id} connection={connection} onDelete={onDelete} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
