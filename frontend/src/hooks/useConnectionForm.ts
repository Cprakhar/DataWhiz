import { ManualConnectionForm } from "@/components/connection/ManualTab"
import { StringConnectionForm } from "@/components/connection/ConnectionStringTab"
import { connStringSchema, manualSchema } from "@/schema/connectionSchema"
import { FieldErrors } from "@/types/auth"
import { getManualDefaultValues, getStringDefaultValues } from "@/utils/connection"
import React, { useCallback, useState } from "react"
import z4 from "zod/v4"
import { AddConnection, TestConnection } from "@/api/connection/connection"
import { DefaultToastOptions, showToast } from "@/components/ui/Toast"
import { AppError } from "@/types/error"
import { Connection } from "@/types/connection"

export default function useConnectionForm(connectionMethod: "manual" | "string") {

  let defaultForm
  if (connectionMethod === "manual") {
    defaultForm = {
      ...getManualDefaultValues("postgresql"),
      connName: "",
      dbType: "postgresql"
    }
  } else {
    defaultForm = {
      ...getStringDefaultValues("postgresql"),
      connName: "",
      dbType: "postgresql"
    }
  }

  const [connections, setConnections] = useState<Connection[]>([])
  const [form, setForm] = useState({...defaultForm})
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testOK, setTestOk] = useState(false)
  const [successOK, setSuccessOK] = useState(false)

  const handleChange = useCallback((name: string,  val: string | number | boolean) => {
    if (name === "dbType") {
      const defaults = getManualDefaultValues(val as string)
      setForm(prev => ({
        ...prev,
        dbType: val as string,
        ...defaults
      }))
    } else setForm(prev => ({ ...prev, [name]: val }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }, []);

  const validate = useCallback(() => {
    const schema = connectionMethod === "manual" ? manualSchema : connStringSchema
    const parsed = z4.safeParse(schema, form)
    if (!parsed.success) {
      const fieldErrors : FieldErrors = {}
      const flattenErrors = z4.flattenError(parsed.error)
      const fieldErrorObj = flattenErrors.fieldErrors as Record<string, string[] | undefined>
      for (const key in fieldErrorObj) {
        fieldErrors[key as keyof (ManualConnectionForm | StringConnectionForm)] = fieldErrorObj[key]?.join(", ") ?? "";
      }
      setErrors(fieldErrors)
      return false
    }
    return true
  }, [form, connectionMethod])

  const handleTestConnection = useCallback(async () => {
    if (!validate) return
    setTestLoading(true)
    setTestOk(false)

    try {
      const res = await TestConnection(form, connectionMethod)
      showToast.success(res.message, {...DefaultToastOptions,
        isLoading: false
      })
      setTestOk(true)

    } catch (err) {
      let errMsg = "An unexpected error occurred."
      if (err && typeof err === "object" && "message" in err) {
        errMsg = (err as AppError).message
      }
      showToast.error(errMsg, {...DefaultToastOptions,
        isLoading: false
      })
      setTestOk(false)
    }
    setTestLoading(false)
  }, [connectionMethod, form, validate])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validate) return
      setLoading(true)
      try {
        const res = await AddConnection(form, connectionMethod)
        showToast.success(res.message, {...DefaultToastOptions,
          isLoading: false
        })
        setConnections(res.data)
        setSuccessOK(true)
      } catch (err) {
        let errMsg = "An unexpected error occurred."
        if (err && typeof err === "object" && "message" in err) {
          errMsg = (err as AppError).message
        }
        showToast.error(errMsg, {...DefaultToastOptions,
          isLoading: false
        })
        setSuccessOK(false)
      }
      setLoading(false)

  }, [validate, form, connectionMethod])

  return {
    form,
    loading,
    testLoading,
    testOK,
    successOK,
    errors,
    connections,
    handleTestConnection,
    handleSubmit,
    handleChange
  }
}