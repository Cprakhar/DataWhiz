import FormField from "@/components/ui/FormField";
import { FieldErrors } from "@/types/auth";
import { getManualDefaultValues } from "@/utils/connection";
import ToggleButton from "@/components/ui/ToggleButton";

export type ManualConnectionForm = {
  dbType: string
  connName: string
  username?: string
  password?: string
  sslMode: boolean
  host?: string
  port?: string
  dbFilePath?: string
  dbName?: string
}

interface ManualTabProps {
  form: ManualConnectionForm;
  errors: FieldErrors;
  handleChange: (name: string, value: string | number | boolean) => void;
}

export default function ManualTab({form, errors, handleChange}: ManualTabProps) {
  const defaults = getManualDefaultValues(form.dbType);
  return (
    <>
      {form.dbType === "sqlite" ? (
        <FormField
          name="dbFilePath"
          label="Database File Path"
          value={form.dbFilePath ?? defaults.dbFilePath}
          onChange={val => handleChange("dbFilePath", val)}
          error={errors.dbFilePath}
          placeholder={defaults.dbFilePath || "/path/to/sqlite.db"}
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FormField
                name="host"
                label="Host"
                value={form.host ?? defaults.host}
                onChange={val => handleChange("host", val)}
                error={errors.host}
                placeholder={defaults.host}
              />
            </div>
            <FormField
              name="port"
              label="Port"
              value={form.port ?? defaults.port}
              onChange={val => handleChange("port", val)}
              error={errors.port}
              placeholder={defaults.port}
            />
          </div>
          <FormField
            name="dbName"
            label="Database Name"
            value={form.dbName ?? defaults.dbName}
            onChange={val => handleChange("dbName", val)}
            error={errors.dbName}
            placeholder={defaults.dbName || "mydatabase"}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="username"
              label="Username"
              value={form.username ?? defaults.username}
              onChange={val => handleChange("username", val)}
              error={errors.username}
              placeholder={defaults.username}
            />
            <FormField
              name="password"
              label="Password"
              value={form.password ?? defaults.password}
              onChange={val => handleChange("password", val)}
              error={errors.password}
              type="password"
              placeholder={defaults.password || "••••••••"}
            />
          </div>
          <div className="mt-4">
            <ToggleButton
              checked={form.host === "localhost" ? false : form.sslMode}
              onChange={val => {
                if (form.host !== "localhost") handleChange("sslMode", val);
              }}
              label="SSL Mode"
              disabled={form.host === "localhost"}
            />
          </div>
        </>
      )}
    </>
  );
}