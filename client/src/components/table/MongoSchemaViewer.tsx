import React, { useState } from "react";

// Recursive type for MongoDB schema
type MongoSchema = string | MongoSchema[] | { [key: string]: MongoSchema };

interface MongoSchemaViewerProps {
  schema: MongoSchema;
  rootName?: string;
}

const TypeBadge = ({ type }: { type: string }) => (
  <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-mono border border-blue-200">
    {type}
  </span>
);

const MongoSchemaNode: React.FC<{ name?: string; schema: MongoSchema; level?: number }> = ({ name, schema, level = 0 }) => {
  // Root node expanded by default
  const [collapsed, setCollapsed] = useState(level > 0);
  const isObject = typeof schema === "object" && schema !== null && !Array.isArray(schema);
  const isArray = Array.isArray(schema);
  const isLeaf = typeof schema === "string" || (Array.isArray(schema) && schema.every(t => typeof t === "string"));

  // For array[string] or array of types
  let typeDisplay: string | null = null;
  if (typeof schema === "string" && schema.startsWith("array[")) {
    typeDisplay = schema;
  } else if (Array.isArray(schema) && schema.every(t => typeof t === "string")) {
    typeDisplay = (schema as string[]).join(" | ");
  } else if (typeof schema === "string") {
    typeDisplay = schema;
  }

  return (
    <div className={`pl-${level * 4} py-0.5`}> {/* Indent by level */}
      <div className="flex items-center gap-1">
        {(isObject || isArray) && level > 0 ? (
          <button
            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-blue-500 focus:outline-none"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <span className="select-none">{collapsed ? "+" : "-"}</span>
          </button>
        ) : (
          <span className="inline-block w-4" />
        )}
        {name !== undefined && (
          <span className="font-mono text-slate-700">
            {JSON.stringify(name)}:
          </span>
        )}
        {typeDisplay && <TypeBadge type={typeDisplay} />}
        {isObject && level > 0 && <TypeBadge type="object" />}
      </div>
      {isObject && !collapsed && (
        <div className="ml-4 border-l border-slate-100 pl-2">
          {Object.entries(schema as { [key: string]: MongoSchema }).map(([k, v]) => (
            <MongoSchemaNode key={k} name={k} schema={v} level={level + 1} />
          ))}
        </div>
      )}
      {isArray && !collapsed && Array.isArray(schema) && (
        <div className="ml-4 border-l border-slate-100 pl-2">
          {(schema as MongoSchema[]).map((v, idx) => (
            <MongoSchemaNode key={idx} name={String(idx)} schema={v} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const MongoSchemaViewer: React.FC<MongoSchemaViewerProps> = ({ schema, rootName }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-x-auto text-sm font-mono">
      <div className="text-slate-500 mb-2 font-semibold">Schema{rootName ? `: ${rootName}` : ""}</div>
      <div>
        <MongoSchemaNode name={rootName} schema={schema} level={0} />
      </div>
    </div>
  );
};

export default MongoSchemaViewer;
