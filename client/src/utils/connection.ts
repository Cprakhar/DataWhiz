// Default values for manual connection form
export const getManualDefaultValues = (type: string) => {
  switch (type) {
    case "postgresql":
      return {
        host: "localhost",
        port: "5432",
        username: "postgres",
        password: "",
        sslMode: false,
        dbName: "mydatabase",
        dbFilePath: ""
      };
    case "mysql":
      return {
        host: "localhost",
        port: "3306",
        username: "root",
        password: "",
        sslMode: false,
        dbName: "mydatabase",
        dbFilePath: ""
      };
    case "mongodb":
      return {
        host: "localhost",
        port: "27017",
        username: "",
        password: "",
        sslMode: false,
        dbName: "mydatabase",
        dbFilePath: ""
      };
    case "sqlite":
      return {
        host: "",
        port: "",
        username: "",
        password: "",
        sslMode: false,
        dbName: "",
        dbFilePath: "/path/mydatabase.db"
      };
    default:
      return {
        host: "",
        port: "",
        username: "",
        password: "",
        sslMode: false,
        dbName: "",
        dbFilePath: ""
      };
  }
};

// Default values for connection string form
export const getStringDefaultValues = (type: string) => {
  switch (type) {
    case "postgresql":
      return {
        connString: "postgresql://username:password@localhost:5432/database_name",
        connName: "",
        dbType: "postgresql"
      };
    case "mysql":
      return {
        connString: "mysql://username:password@localhost:3306/database_name",
        connName: "",
        dbType: "mysql"
      };
    case "mongodb":
      return {
        connString: "mongodb://username:password@localhost:27017/database_name",
        connName: "",
        dbType: "mongodb"
      };
    default:
      return {
        connString: "",
        connName: "",
        dbType: type
      };
  }
};
export const getDBColor = (type: string) => {
    switch (type) {
      case 'postgresql':
        return 'bg-emerald-100 text-emerald-600';
      case 'mysql':
        return 'bg-orange-100 text-orange-600';
      case 'mongodb':
        return 'bg-green-100 text-green-600';
      case 'sqlite':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

export const getDBIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
        return "/postgresql.svg"
      case 'mysql':
        return '/mysql.svg';
      case 'mongodb':
        return '/mongodb.svg';
      case 'sqlite':
        return '/sqlite.svg';
      default:
        return 'fas fa-database';
    }
  };

export const getDefaultFormValues = (type: string) => {
  switch (type) {
    case "postgresql":
      return {
        host: "localhost",
        port: 5432,
      }
    case "mysql":
      return {
        host: "localhost",
        port: 3306,
      }
    case "mongodb":
      return {
        host: "localhost",
        port: 27017
      }
    default:
      return {
        host: "",
        port: -1
      }
  }
}