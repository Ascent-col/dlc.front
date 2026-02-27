export type OptionType = {
  nombre: string;
  value: string;
  rumbo: string;
  date: string;
  hora: string;
  nomenclatura: string;
  recorridos: { date: string; recorrido: [string, string][] }[];
  coordinates: [number, number];
};
export type LastLocation = {
  status: number;
  id: number;
  iduser: number;
  latitude: number;
  longitude: number;
  date: string;
  course: string;
  serverDate: string;
  nomenclature: string;
};

export type User = {
  id: number;
  name: string;
  lastname: string;
  username: string;
  email: string;
  createDate: string;
  active: boolean;
  phone: string;
  cedula: number;
  icon: string;
  lastlocation: LastLocation;
  company: Company;
  role: number;
  hasAlert: boolean;
  mobileVersion: string;
};

export type Company = {
  id: number;
  name: string;
  email: string;
  date: string;
  active: boolean;
  nit: string;
  adress: string;
  logo: string;
  users: Partial<User>[];
  monitoringTime: string[];
};

export type NewUser = User & {
  password: string;
  companyId: number;
};

export type SelectOption = {
  key?: number | string;
  text?: string;
  value: number | string;
  label: string;
  disabled?: boolean;
};

export type CoordsInfo = {
  rumbo: string;
  date: string;
  hora: string;
  nomenclatura: string;
  coordenadas: {
    longitud: string;
    latitud: string;
  };
  recorridos: [
    {
      date: string;
      recorrido: [
        [string, string, string],
        [string, string, string],
        [string, string, string],
        [string, string, string],
      ];
    },
    {
      date: string;
      recorrido: [
        [string, string, string],
        [string, string, string],
        [string, string, string],
        [string, string, string],
      ];
    },
  ];
};
export type Location = {
  id: string;
  iduser: string;
  latitude: string;
  longitude: string;
  date: string;
  course: string;
  serverDate: string;
  nomenclature: string;
  speed: string;
};

export type Alert = {
  id: number;
  iduser: number;
  companyId: number;
  date: string;
  latitude: string;
  longitude: string;
  message: string;
  serverDate: string;
  status: number;
  fullname: string;
};

export type LocationByDate = {
  date: string;
  route: Partial<Location> & { time: string; coordinates: number[] }[];
};
export type RouteItem = {
  time: string;
  date: string;
  coordinates: number[];
};

export type Role = {
  id: number;
  name: string;
  description: string;
  customName: string;
};

export type FetchHistory = {
  user: number;
  recorridoI: string;
  recorridoF: string;
};
