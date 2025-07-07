import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConnectionForm } from "./useConnectionForm";
import { ConnectionTypeSelector } from "./ConnectionTypeSelector";
import { InfoCard } from "./InfoCard";
import { ConnectionManualForm } from "./ConnectionManualForm";
import { ConnectionStringForm } from "./ConnectionStringForm";
import { TestConnectionSection } from "./TestConnectionSection";
import { FormActions } from "./FormActions";

export function ConnectionForm() {
  const form = useConnectionForm();
  return (
    <Dialog open={form.show} onOpenChange={form.setShow}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Add Database Connection</DialogTitle>
          <DialogDescription>Configure a new database connection. Test the connection before saving.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <ConnectionTypeSelector value={form.formData.db_type} onChange={form.handleTypeChange} />
            <InfoCard dbType={form.formData.db_type} />
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Connection Configuration</h3>
            {form.formData.db_type !== "sqlite" && (
              <Tabs
                defaultValue={form.formData.useConnectionString ? "string" : "manual"}
                value={form.formData.useConnectionString ? "string" : "manual"}
                onValueChange={form.handleTabChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Configuration</TabsTrigger>
                  <TabsTrigger value="string">Connection String</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4">
                  <ConnectionManualForm formData={form.formData} setFormData={form.setFormData} />
                </TabsContent>
                <TabsContent value="string" className="space-y-4">
                  <ConnectionStringForm
                    dbType={form.formData.db_type}
                    value={form.formData.connectionString || ""}
                    onChange={(val) => form.setFormData(prev => ({ ...prev, connectionString: val }))}
                    name={form.formData.name}
                    setName={(val) => form.setFormData(prev => ({ ...prev, name: val }))}
                  />
                </TabsContent>
              </Tabs>
            )}
            {form.formData.db_type === "sqlite" && <ConnectionManualForm formData={form.formData} setFormData={form.setFormData} />}
          </div>
          <Separator />
          <TestConnectionSection
            testStatus={form.testStatus}
            testError={form.testError}
            onTest={form.handleTestConnection}
            disabled={
              form.testStatus === "testing" ||
              (form.formData.db_type === "sqlite"
                ? !form.formData.database?.trim()
                : form.formData.useConnectionString
                ? !form.formData.connectionString?.trim()
                : !form.formData.database?.trim())
            }
          />
          <FormActions
            onCancel={() => form.setShow(false)}
            isSubmitting={form.isSubmitting}
            canSubmit={form.testStatus === "success" && !form.isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
