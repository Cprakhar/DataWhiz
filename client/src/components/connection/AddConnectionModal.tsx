import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import useConnectionForm from "@/hooks/useConnectionForm";
import { XCircle } from "lucide-react";
import TestTube from "../ui/TestTubeVibrate";
import SaveIcon from "../ui/Save";
import ManualTab, { ManualConnectionForm } from "./ManualTab";
import ConnectionStringTab, { StringConnectionForm } from "./ConnectionStringTab";
import DBTypeSelector from "./DBTypeSelector";
import FormField from "../ui/FormField";

interface AddConnectionModalProps {
  refreshConnections: () => Promise<void>
  onClose: () => void;

}

export default function AddConnectionModal({ onClose, refreshConnections }: AddConnectionModalProps) {
  const [connectionMethod, setConnectionMethod] = useState<'manual' | 'string'>('manual');
  const {form, errors, handleChange, handleSubmit, handleTestConnection, loading, successOK, testLoading, testOK} = useConnectionForm(connectionMethod)

  useEffect(() => {
    if (successOK) {
      refreshConnections()
      onClose()
    }
  }, [successOK, onClose, refreshConnections])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay with blur and dim background */}
      <div
        className="absolute inset-0 bg-black opacity-25"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">Add Database Connection</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-row gap-4 items-center mb-4">
            <div className="w-full">
              <DBTypeSelector dbType={form.dbType} setDbType={val => handleChange("dbType", val)} error={errors.dbType}/>
            </div>
            <div className="w-full">
              <FormField
                name="connName"
                label="Connection Name"
                value={form.connName}
                onChange={val => handleChange("connName", val)}
                error={errors.connection_name}
                placeholder="My Database Connection"
              />
            </div>
          </div>
          {/* Connection Method Tabs */}
          {form.dbType !== "sqlite" ? <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setConnectionMethod('manual')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                connectionMethod === 'manual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manual Setup
            </button>
            <button
              onClick={() => setConnectionMethod('string')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                connectionMethod === 'string'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Connection String
            </button>
          </div> : null}

          {/* Form */}
          <form onSubmit={async (e) => { e.preventDefault(); await handleSubmit(e); }} className="space-y-4" id="add-connection">
            {connectionMethod === "manual" ? 
              <ManualTab 
                form={form as ManualConnectionForm} 
                errors={errors} 
                handleChange={handleChange}
              /> : 
               ( form.dbType !== "sqlite" ? <ConnectionStringTab 
                form={form as StringConnectionForm}
                errors={errors}
                handleChange={handleChange}
              /> : null)
            }

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 mt-6">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={testLoading}
                className="bg-blue-400 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md flex items-center"
              >
                <span className="flex items-center">
                  <TestTube wiggle={testLoading} className="mr-2"/>
                  {testLoading ? "Testing..." : "Test connection"}
                </span>
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!testOK || loading}
                className="bg-green-400 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-md flex items-center"
              >
                <span className="flex items-center">
                  <SaveIcon loading={loading} className="mr-2"/>
                  {loading ? "Saving..." : "Save Connection"}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}