import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Database, Key, Server, Eye, EyeOff, Globe } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export const ConnectionManualForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, watch, formState: { errors } } = useFormContext();
  const db_type = watch("db_type");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Connection Name</Label>
        <Input
          id="name"
          placeholder="My Database Connection"
          {...register("name", { required: "Connection name is required" })}
        />
        {errors.name && <span className="text-xs text-red-500">{errors.name.message as string}</span>}
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
            {...register("host", { required: db_type !== "sqlite" ? "Host is required" : false })}
            disabled={db_type === "sqlite"}
          />
          {errors.host && <span className="text-xs text-red-500">{errors.host.message as string}</span>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            type="number"
            {...register("port", {
              required: db_type !== "sqlite" ? "Port is required" : false,
              valueAsNumber: true,
              min: db_type !== "sqlite" ? { value: 1, message: "Port must be a positive number" } : undefined,
            })}
            disabled={db_type === "sqlite"}
          />
          {errors.port && <span className="text-xs text-red-500">{errors.port.message as string}</span>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="database" className="flex items-center gap-2">
          <Database className="h-3 w-3" />
          {db_type === "sqlite" ? "Database File Path" : "Database Name"}
        </Label>
        <Input
          id="database"
          placeholder={db_type === "sqlite" ? "/path/to/database.db" : "database_name"}
          {...register("database", { required: "Database is required" })}
        />
        {errors.database && <span className="text-xs text-red-500">{errors.database.message as string}</span>}
      </div>
      {db_type !== "sqlite" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="username"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && <span className="text-xs text-red-500">{errors.username.message as string}</span>}
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
                {...register("password", { required: "Password is required" })}
                className="pr-10"
              />
              {errors.password && <span className="text-xs text-red-500">{errors.password.message as string}</span>}
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
              {...register("ssl")}
              disabled={watch("host") === "localhost" || watch("host") === "127.0.0.1"}
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
