export type DBType = "mongodb" | "postgresql" | "mysql" | "sqlite"

export type ConnectionFormData = {
    connection_name: string
    db_type: string
    host?: string
    port?: number
    db_name: string
    username: string
    password: string
    ssl_mode: boolean
    connection_string?: string
}

export type Connection = Omit<ConnectionFormData, "password" | "ssl_mode"> & {
    id: string
    is_active: boolean
}