import { useState } from "react";
import AddConnectionModal from "./AddConnectionModal";
import type { Connection } from "@/types/connection";
import useConnectionForm from "@/hooks/useConnectionForm";
import { getDBColor, getDBIcon } from "@/utils/connection";
import { Plug, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export default function ConnectionsTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const {loading, connections, onDelete} = useConnectionForm()

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
          <div className="bg-white rounded-xl p-6">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Database Connections</h2>
          <p className="text-slate-600 mt-1">Manage your database connections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="mr-2"/>
          Add Connection
        </button>
      </div>

      {/* Connections List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">
            {connections.length > 0 ? 'Active Connections' : 'No Connections'}
          </h3>
        </div>
        
        {connections.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plug className="text-slate-400"/>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No connections yet</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first database connection</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Connection
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {connections.map((connection: Connection) => (
              <div key={connection.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getDBColor(connection.db_type)}`}>
                      <Image src={getDBIcon(connection.db_type)} alt={connection.db_type} width={8} height={8}/>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{connection.connection_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                        <span>{connection.host}:{connection.port}</span>
                        <span>{connection.db_name}</span>
                        <span>{connection.username}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      connection.is_active 
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        connection.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}></div>
                      {connection.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => onDelete(connection.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddConnectionModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}