export interface VisitrackSurvey {
  SurveyID: number;
  Title: string;
  [field: string]: unknown;
}

export interface VisitrackUser {
  UserID: number;
  UserName: string;
  Active: boolean | null;
}

export interface VisitrackActivityUser {
  UserID: number;
  UserName: string;
  TotalActividades: number;
  Porcentaje: number;
}

export interface VisitrackActivitySurvey {
  SurveyID: number;
  Title: string;
  TotalActividades: number;
  Porcentaje: number;
  Usuarios: VisitrackActivityUser[];
  more: unknown;
}

export interface VisitrackActivityStats {
  status: string | null;
  TotalSurveys: number;
  Usuarios: { Activos: number; Inactivos: number };
  TotalActividades: number;
  DetalleSurveys: VisitrackActivitySurvey[];
}

export interface VisitrackCounterResult {
  SurveyID: number;
  Title: string;
  TotalActividades: number;
  TotalActivas: number;
  TotalEliminadas: number;
  ActividadesSinLocation: number;
  ActividadesSinAsset: number;
  Locations: unknown[];
  Assets: unknown[];
  LocationsSinActividad: unknown[];
  AssetsSinActividad: unknown[];
}

export interface VisitrackCounterError {
  SurveyID: number;
  code: string;
  message: string;
}

export interface VisitrackCountersResponse {
  data: VisitrackCounterResult[];
  errors: VisitrackCounterError[];
  meta: { requested: number; succeeded: number; failed: number };
}

export interface VisitrackFilters {
  from: string;
  to: string;
  surveyIds?: number[];
}
