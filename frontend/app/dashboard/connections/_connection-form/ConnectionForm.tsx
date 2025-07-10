import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Dispatch, SetStateAction } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConnectionForm } from "./useConnectionForm";
import { ConnectionTypeSelector } from "./ConnectionTypeSelector";
import { InfoCard } from "./InfoCard";
import { ConnectionManualForm } from "./ConnectionManualForm";
import { ConnectionStringForm } from "./ConnectionStringForm";
import { TestConnectionSection } from "./TestConnectionSection";
import { FormActions } from "./FormActions";
import { useForm, FormProvider } from "react-hook-form";
import { ConnectionFormData, DatabaseType } from "@/components/database/types";

type ConnectionFormProps = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
};

export const ConnectionForm = ({ show, setShow }: ConnectionFormProps) => {
  const methods = useForm<ConnectionFormData>({
    defaultValues: {
      name: "",
      db_type: "postgresql" as DatabaseType,
      host: "localhost",
      port: 5432,
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionString: "",
      useConnectionString: false,
    },
  });
  const form = useConnectionForm(methods, () => setShow(false));
  const watched = methods.watch();

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Add Database Connection</DialogTitle>
          <DialogDescription>Configure a new database connection. Test the connection before saving.</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(form.handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <ConnectionTypeSelector value={watched.db_type} onChange={form.handleTypeChange} />
              <InfoCard dbType={watched.db_type} />
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Connection Configuration</h3>
              {watched.db_type !== "sqlite" && (
                <Tabs
                  defaultValue={watched.useConnectionString ? "string" : "manual"}
                  value={watched.useConnectionString ? "string" : "manual"}
                  onValueChange={form.handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Configuration</TabsTrigger>
                    <TabsTrigger value="string">Connection String</TabsTrigger>
                  </TabsList>
                  <TabsContent value="manual" className="space-y-4">
                    <ConnectionManualForm />
                  </TabsContent>
                  <TabsContent value="string" className="space-y-4">
                    <ConnectionStringForm dbType={watched.db_type} />
                  </TabsContent>
                </Tabs>
              )}
              {watched.db_type === "sqlite" && <ConnectionManualForm />}
            </div>
            <Separator />
            <TestConnectionSection
              testStatus={form.testStatus}
              testError={form.testError}
              onTest={form.handleTestConnection}
              disabled={
                form.testStatus === "testing" ||
                (watched.db_type === "sqlite"
                  ? !watched.database?.trim()
                  : watched.useConnectionString
                  ? !watched.connectionString?.trim()
                  : !watched.database?.trim())
              }
            />
            <FormActions
              onCancel={() => setShow(false)}
              isSubmitting={form.isSubmitting}
              canSubmit={form.testStatus === "success" && !form.isSubmitting}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
