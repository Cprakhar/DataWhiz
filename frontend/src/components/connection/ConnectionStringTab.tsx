import FormField from "@/components/ui/FormField";
import Select from "@/components/ui/Select";
import { FieldErrors } from "@/types/auth";
import { getStringDefaultValues } from "@/utils/connection";

export type StringConnectionForm = {
  dbType: string
  connString: string
  connName: string
}

interface ConnectionStringTabProps {
  form: StringConnectionForm;
  errors: FieldErrors;
  handleChange: (name: string, value: string | number) => void;
}

export default function ConnectionStringTab({ form, errors, handleChange }: ConnectionStringTabProps) {
  const defaults = getStringDefaultValues(form.dbType)
  return (
    <>
      <FormField
        name="connName"
        label="Connection Name"
        value={form.connName}
        onChange={val => handleChange("connName", val)}
        error={errors.connection_name}
        placeholder="My Database Connection"
      />
      <Select
        label="Database Type"
        value={form.dbType}
        onChange={val => {
          handleChange("dbType", val);
          Object.entries(getStringDefaultValues(val)).forEach(([key, value]) => {
            handleChange(key, value as string | number);
          });
        }}
        options={[
          { value: "postgresql", label: "PostgreSQL" },
          { value: "mysql", label: "MySQL" },
          { value: "mongodb", label: "MongoDB" },
          { value: "sqlite", label: "SQLite" },
        ]}
        error={errors.dbType}
        placeholder="Select Database Type"
      />
      <FormField
        name="connString"
        label="Connection String"
        value={form.connString ?? defaults.connString}
        onChange={val => handleChange("connString", val)}
        error={errors.connString}
        type="textarea"
        placeholder={defaults.connString}
      />
      <p className="text-xs text-slate-500">Enter your full database connection string</p>
    </>
  );
}
