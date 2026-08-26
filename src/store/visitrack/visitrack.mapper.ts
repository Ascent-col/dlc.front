import type {
  VisitrackCounterError,
  VisitrackCounterResult,
  VisitrackCountersResponse,
} from '@/modules/dashboard/dashboard.types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const asNumber = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const mapCounterResult = (
  value: unknown,
  globalLocationsWithoutActivity: unknown[],
  globalAssetsWithoutActivity: unknown[],
): VisitrackCounterResult | null => {
  if (!isRecord(value)) return null;

  return {
    SurveyID: asNumber(value.SurveyID),
    Title: asString(value.Title),
    TotalActividades: asNumber(value.TotalActividades),
    TotalActivas: asNumber(value.TotalActivas),
    TotalEliminadas: asNumber(value.TotalEliminadas),
    ActividadesSinLocation: asNumber(value.ActividadesSinLocation),
    ActividadesSinAsset: asNumber(value.ActividadesSinAsset),
    Locations: asArray(value.Locations),
    Assets: asArray(value.Assets),
    LocationsSinActividad: Array.isArray(value.LocationsSinActividad)
      ? value.LocationsSinActividad
      : globalLocationsWithoutActivity,
    AssetsSinActividad: Array.isArray(value.AssetsSinActividad)
      ? value.AssetsSinActividad
      : globalAssetsWithoutActivity,
  };
};

const mapCounterError = (value: unknown): VisitrackCounterError | null => {
  if (!isRecord(value)) return null;
  return {
    SurveyID: asNumber(value.SurveyID),
    code: asString(value.code),
    message: asString(value.message),
  };
};

/**
 * Normaliza tanto el contrato interno `{ data, errors, meta }` como la respuesta
 * directa observada de VisitTrack `{ response, LocationsSinActividad, ... }`.
 */
export const mapCounter = (payload: unknown): VisitrackCountersResponse => {
  if (!isRecord(payload)) {
    throw new Error('Invalid Visitrack counters response');
  }

  const globalLocationsWithoutActivity = asArray(payload.LocationsSinActividad);
  const globalAssetsWithoutActivity = asArray(payload.AssetsSinActividad);
  const source = Array.isArray(payload.data)
    ? payload.data
    : asArray(payload.response);
  const data = source
    .map((counter) =>
      mapCounterResult(
        counter,
        globalLocationsWithoutActivity,
        globalAssetsWithoutActivity,
      ),
    )
    .filter((counter): counter is VisitrackCounterResult => counter !== null);
  const errors = asArray(payload.errors)
    .map(mapCounterError)
    .filter((error): error is VisitrackCounterError => error !== null);
  const meta = isRecord(payload.meta) ? payload.meta : undefined;

  return {
    data,
    errors,
    meta: {
      requested: meta ? asNumber(meta.requested) : asNumber(payload.count),
      succeeded: meta ? asNumber(meta.succeeded) : data.length,
      failed: meta ? asNumber(meta.failed) : errors.length,
    },
  };
};
