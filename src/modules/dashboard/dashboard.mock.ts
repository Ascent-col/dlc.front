export type DashboardUser = {
  id: number;
  name: string;
  activities: number;
};

export type DashboardLocation = {
  id: number;
  name: string;
  activities: number;
  active: number;
  deleted: number;
};

export type DashboardSurvey = {
  id: number;
  title: string;
  activities: number;
  active: number;
  deleted: number;
  withoutLocation: number;
  withoutAsset: number;
  users: DashboardUser[];
  locations: DashboardLocation[];
  locationsWithoutActivity: { id: number; name: string }[];
};

export const dashboardSurveys: DashboardSurvey[] = [
  {
    id: 21753,
    title: 'Record de patrullaje',
    activities: 242,
    active: 235,
    deleted: 7,
    withoutLocation: 12,
    withoutAsset: 19,
    users: [
      { id: 301, name: 'Supervisor 2 P3', activities: 118 },
      { id: 205, name: 'Operaciones P3 Seguridad', activities: 77 },
      { id: 119, name: 'Supervisor 1 P3', activities: 47 },
    ],
    locations: [
      {
        id: 1054,
        name: 'Planta Norte',
        activities: 96,
        active: 94,
        deleted: 2,
      },
      {
        id: 1058,
        name: 'Almacén Central',
        activities: 72,
        active: 69,
        deleted: 3,
      },
      {
        id: 1061,
        name: 'Centro de distribución Sur',
        activities: 62,
        active: 60,
        deleted: 2,
      },
    ],
    locationsWithoutActivity: [
      { id: 1072, name: 'Portería occidental' },
      { id: 1084, name: 'Bodega de repuestos' },
    ],
  },
  {
    id: 21804,
    title: 'Rondas',
    activities: 418,
    active: 409,
    deleted: 9,
    withoutLocation: 6,
    withoutAsset: 14,
    users: [
      { id: 301, name: 'Supervisor 2 P3', activities: 176 },
      { id: 205, name: 'Operaciones P3 Seguridad', activities: 142 },
      { id: 412, name: 'Coordinador de turno', activities: 100 },
    ],
    locations: [
      {
        id: 1054,
        name: 'Planta Norte',
        activities: 181,
        active: 177,
        deleted: 4,
      },
      {
        id: 1058,
        name: 'Almacén Central',
        activities: 129,
        active: 126,
        deleted: 3,
      },
      {
        id: 1061,
        name: 'Centro de distribución Sur',
        activities: 102,
        active: 100,
        deleted: 2,
      },
    ],
    locationsWithoutActivity: [{ id: 1090, name: 'Archivo central' }],
  },
  {
    id: 21916,
    title: 'Inspección diaria',
    activities: 156,
    active: 151,
    deleted: 5,
    withoutLocation: 18,
    withoutAsset: 22,
    users: [
      { id: 119, name: 'Supervisor 1 P3', activities: 74 },
      { id: 412, name: 'Coordinador de turno', activities: 51 },
      { id: 508, name: 'Inspector HSEQ', activities: 31 },
    ],
    locations: [
      {
        id: 1058,
        name: 'Almacén Central',
        activities: 68,
        active: 66,
        deleted: 2,
      },
      {
        id: 1061,
        name: 'Centro de distribución Sur',
        activities: 46,
        active: 44,
        deleted: 2,
      },
      {
        id: 1054,
        name: 'Planta Norte',
        activities: 24,
        active: 23,
        deleted: 1,
      },
    ],
    locationsWithoutActivity: [
      { id: 1072, name: 'Portería occidental' },
      { id: 1090, name: 'Archivo central' },
    ],
  },
  {
    id: 22102,
    title: 'Control del servicio no conforme (PQR)',
    activities: 0,
    active: 0,
    deleted: 0,
    withoutLocation: 0,
    withoutAsset: 0,
    users: [],
    locations: [],
    locationsWithoutActivity: [
      { id: 1054, name: 'Planta Norte' },
      { id: 1058, name: 'Almacén Central' },
    ],
  },
];
