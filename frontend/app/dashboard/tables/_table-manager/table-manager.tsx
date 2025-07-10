"use client"

import type React from "react"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableDataView } from "./_table/TableDataView"
import { CreateTableDialog } from "./_table/CreateTableDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Database, TableIcon, Link as LinkIcon } from "lucide-react"
import { TableList } from "./_table/TableList"
import RecordFormDialog from "./_record/RecordFormDialog"
import TableInfoHeader from "./_table/TableInfoHeader"
import TableStructureView from "./_table/TableStructureView"
import { getDatabaseColor } from "@/components/database/utils"
import { useTableManagerContainer } from "./useTableManagerContainer"


export function TableManager() {
  const container = useTableManagerContainer();
  const {
    activeConnection,
    tables, setTables,
    selectedTable, setSelectedTable,
    showBulkDelete, setShowBulkDelete,
    showBulkUpdate, setShowBulkUpdate,
    showImport, setShowImport,
    updateData, setUpdateData,
    importData, setImportData,
    isProcessing, setIsProcessing,
    progress, setProgress,
    showCreateTable, setShowCreateTable,
    showCreateRecord, setShowCreateRecord,
    editingRecord, setEditingRecord,
    searchTerm, setSearchTerm,
    currentPage, setCurrentPage,
    selectedRecords, setSelectedRecords,
    editingCell, setEditingCell,
    editInputRef,
    recordsPerPage,
    tableName, setTableName,
    columns, setColumns,
    recordFormData, setRecordFormData,
    loadingRecords, setLoadingRecords,
    // handlers and utils will be destructured and used below
    startEditing,
    saveEdit,
    cancelEdit,
    handleKeyDown,
    formatCellValue,
    getInputType,
    getRecordKey,
    handleBulkDelete,
    handleBulkUpdate,
    handleImport,
    handleExport,
    addColumn,
    updateColumn,
    removeColumn,
    handleCreateTable,
    handleRecordFormChange,
    handleRecordFormCancel,
    handleRecordFormSubmit,
    handleDeleteTable,
    handleDeleteRecord,
    toggleRecordSelection,
    toggleAllRecords,
    refetchRecords,
    filteredRecords,
    paginatedRecords,
    totalPages,
    isEditingRecord,
  } = container;

  if (!activeConnection) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Database Selected</CardTitle>
            <CardDescription>Please select a database connection to manage tables and records.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TableIcon className="h-6 w-6" />
              Table Manager
            </h2>
            <p className="text-muted-foreground">Manage tables and records in {activeConnection.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDatabaseColor(activeConnection.db_type)}>{activeConnection.db_type.toUpperCase()}</Badge>
            <Button onClick={() => setShowCreateTable(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Table
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <TableList
            tables={tables}
            selectedTable={selectedTable}
            onSelect={setSelectedTable}
            onDelete={handleDeleteTable}
          />

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTable ? (
              <>
                {/* Table Info and Actions */}
                <Card>
                <CardHeader>
                  <TableInfoHeader
                    tableName={selectedTable.name}
                    rowCount={selectedTable.rowCount}
                    columnCount={selectedTable.columns.length}
                    dbType={activeConnection.db_type}
                    dbColor={getDatabaseColor(activeConnection.db_type)}
                    onCreateRecord={() => setShowCreateRecord(true)}
                    onRefresh={refetchRecords}
                    loadingRecords={loadingRecords}
                    bulkOpsProps={{
                      selectedRecords,
                      showBulkDelete,
                      setShowBulkDelete,
                      showBulkUpdate,
                      setShowBulkUpdate,
                      showImport,
                      setShowImport,
                      updateData,
                      setUpdateData,
                      importData,
                      setImportData,
                      isProcessing,
                      progress,
                      handleBulkDelete,
                      handleBulkUpdate,
                      handleImport,
                      handleExport,
                    }}
                  />
                </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="data" className="w-full">
                      <TabsList>
                        <TabsTrigger value="data">Data</TabsTrigger>
                        <TabsTrigger value="structure">Structure</TabsTrigger>
                      </TabsList>

                      <TabsContent value="data" className="space-y-4">
                        <TableDataView
                          columns={selectedTable.columns}
                          records={selectedTable.records}
                          paginatedRecords={paginatedRecords}
                          selectedRecords={selectedRecords}
                          editingCell={editingCell}
                          editInputRef={editInputRef as React.RefObject<HTMLInputElement>}
                          getRecordKey={getRecordKey}
                          formatCellValue={formatCellValue}
                          getInputType={getInputType}
                          toggleRecordSelection={toggleRecordSelection}
                          toggleAllRecords={toggleAllRecords}
                          startEditing={startEditing}
                          saveEdit={saveEdit}
                          cancelEdit={cancelEdit}
                          handleKeyDown={handleKeyDown}
                          setEditingCell={setEditingCell}
                          currentPage={currentPage}
                          totalPages={totalPages}
                          recordsPerPage={recordsPerPage}
                          filteredRecords={filteredRecords}
                          setCurrentPage={setCurrentPage}
                          onEditRecord={(record) => setEditingRecord(record)}
                          onDeleteRecord={(record) => handleDeleteRecord(record.id)}
                        />
                      </TabsContent>
                      <TabsContent value="structure" className="space-y-4">
                        <TableStructureView columns={selectedTable.columns} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <TableIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Table Selected</h3>
                  <p className="text-muted-foreground">Select a table from the sidebar to view and manage its data.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <CreateTableDialog
          open={showCreateTable}
          onOpenChange={setShowCreateTable}
          tableName={tableName}
          setTableName={setTableName}
          columns={columns}
          setColumns={setColumns}
          addColumn={addColumn}
          updateColumn={updateColumn}
          removeColumn={removeColumn}
          handleCreateTable={handleCreateTable}
        />
        <RecordFormDialog
          open={showCreateRecord || editingRecord !== null}
          isEditing={isEditingRecord}
          columns={selectedTable?.columns || []}
          formData={recordFormData}
          editingRecord={editingRecord}
          onChange={handleRecordFormChange}
          onCancel={handleRecordFormCancel}
          onSubmit={handleRecordFormSubmit}
          getInputType={getInputType}
        />
      </div>
    </div>
  )
}
