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