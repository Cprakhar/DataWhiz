import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Database, Key, Server, Eye, EyeOff, Globe } from "lucide-react";
import { useState } from "react";
import { ConnectionFormData } from "@/components/database/types";

interface Props {
  formData: ConnectionFormData;
  setFormData: (updater: (prev: ConnectionFormData) => ConnectionFormData) => void;
}

export function ConnectionManualForm({ formData, setFormData }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Connection Name</Label>
        <Input
          id="name"
          placeholder="My Database Connection"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="host" className="flex items-center gap-2">
            <Server className="h-3 w-3" />
            Host
          </Label>
          <Input
            id="host"
            placeholder="localhost"
            value={formData.host}
            onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
            disabled={formData.db_type === "sqlite"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            type="number"
            value={formData.port}
            onChange={(e) => setFormData((prev) => ({ ...prev, port: Number.parseInt(e.target.value) || 0 }))}
            disabled={formData.db_type === "sqlite"}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="database" className="flex items-center gap-2">
          <Database className="h-3 w-3" />
          {formData.db_type === "sqlite" ? "Database File Path" : "Database Name"}
        </Label>
        <Input
          id="database"
          placeholder={formData.db_type === "sqlite" ? "/path/to/database.db" : "database_name"}
          value={formData.database}
          onChange={(e) => setFormData((prev) => ({ ...prev, database: e.target.value }))}
        />
      </div>
      {formData.db_type !== "sqlite" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Key className="h-3 w-3" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="ssl"
              checked={formData.ssl}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, ssl: checked }))}
              disabled={formData.host === "localhost" || formData.host === "127.0.0.1"}
            />
            <Label htmlFor="ssl" className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              Use SSL/TLS
            </Label>
          </div>
        </>
      )}
    </div>
  );
}
