import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { getDatabaseColor } from "../utils";
import { DatabaseConnection } from "@/components/database/types";
import { ConnectionStatus } from "./ConnectionStatus";

interface Props {
  connection: DatabaseConnection;
  onDelete: (id: string) => void;
}

export function ConnectionRow({ connection, onDelete }: Props) {
  return (
    <TableRow key={connection.id}>
      <TableCell className="font-medium">{connection.name}</TableCell>
      <TableCell>
        {connection.db_type? (
          <Badge className={getDatabaseColor(connection.db_type as any)}>
            {connection.db_type?.toUpperCase()}
          </Badge>
        ) : (
          <Badge className="bg-gray-200 text-gray-700">Unknown</Badge>
        )}
      </TableCell>
      <TableCell className="font-mono text-sm">
        {connection.db_type === "sqlite"
          ? "Local File"
          : (connection.useConnectionString || !connection.host || !connection.port)
          ? "Cloud DB"
          : `${connection.host}:${connection.port}`}
      </TableCell>
      <TableCell className="font-mono text-sm">{connection.database}</TableCell>
      <TableCell>
        <ConnectionStatus connected={!!connection.isConnected} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {connection.lastConnected
          ? new Date(connection.lastConnected).toLocaleDateString()
          : "Never"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Test Connection button can be implemented if backend supports it */}
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(connection.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
