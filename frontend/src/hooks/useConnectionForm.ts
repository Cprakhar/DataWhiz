import { Connection } from "@/types/connection";
import { useState } from "react";
import { DeleteConnection } from "@/api/connection/connection";

export default function useConnectionForm() {
    const [loading, setLoading] = useState(false)
    const [connections, SetConnections] = useState<Connection[]>([])
    
    return {
        loading,
        connections,
        onDelete: DeleteConnection    
    }
}