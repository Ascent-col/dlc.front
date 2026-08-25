import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Empty,
  Flex,
  Layout,
  Progress,
  Select,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import dayjs, { Dayjs } from 'dayjs';
import { useSelector } from 'react-redux';
import HeaderComponent from '@/commons/header';
import useAuth from '@/modules/auth/hooks/useAuth';
import { RootState } from '@/store/store';
import {
  useGetVisitrackCountersQuery,
  useGetVisitrackStatsQuery,
  useGetVisitrackSurveysQuery,
  useGetVisitrackUsersQuery,
} from '@/store/visitrack/visitrack.slice';
import type { VisitrackFilters } from './dashboard.types';
import styles from './dashboard.module.scss';

const { Content } = Layout;
const { RangePicker } = DatePicker;

type DisplayLocation = {
  id: number | string;
  name: string;
  activities: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toDisplayLocation = (
  value: unknown,
  index: number,
): DisplayLocation | null => {
  if (!isRecord(value)) return null;
  const rawId = value.LocationID ?? value.ID;
  const rawName = value.LocationName ?? value.Name;
  const rawActivities = value.TotalActividades ?? 0;
  if (
    (typeof rawId !== 'number' && typeof rawId !== 'string') ||
    typeof rawName !== 'string'
  ) {
    return null;
  }
  return {
    id: rawId || `location-${index}`,
    name: rawName,
    activities:
      typeof rawActivities === 'number' && Number.isFinite(rawActivities)
        ? rawActivities
        : 0,
  };
};

const getErrorStatus = (error: unknown) =>
  isRecord(error) && 'status' in error
    ? (error as FetchBaseQueryError).status
    : undefined;

const errorMessage = (error: unknown) => {
  const status = getErrorStatus(error);
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (status === 403)
    return 'No tienes permisos para consultar este dashboard.';
  if (status === 422)
    return 'Revisa el rango seleccionado o la configuración de Visitrack de la compañía.';
  if (status === 504) return 'Visitrack tardó demasiado en responder.';
  return 'No fue posible cargar la información de Visitrack.';
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('es-CO').format(value);

const DashboardPage = () => {
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const { startLogout } = useAuth();
  const initialRange: [Dayjs, Dayjs] = [dayjs().subtract(29, 'day'), dayjs()];
  const [surveyIds, setSurveyIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(initialRange);
  const [appliedFilters, setAppliedFilters] = useState<VisitrackFilters>({
    from: initialRange[0].format('YYYY-MM-DD'),
    to: initialRange[1].format('YYYY-MM-DD'),
  });
  const [selectedSurveyId, setSelectedSurveyId] = useState<number>();
  const [onlyInactive, setOnlyInactive] = useState(false);

  const surveysQuery = useGetVisitrackSurveysQuery();
  const usersQuery = useGetVisitrackUsersQuery();
  const statsQuery = useGetVisitrackStatsQuery(appliedFilters);
  const countersQuery = useGetVisitrackCountersQuery(appliedFilters);
  const isLoading =
    surveysQuery.isLoading || statsQuery.isLoading || countersQuery.isLoading;
  const isFetching =
    surveysQuery.isFetching ||
    statsQuery.isFetching ||
    countersQuery.isFetching;
  const blockingError = statsQuery.error ?? countersQuery.error;
  const rangeTooLong = dateRange[1].diff(dateRange[0], 'day') > 92;

  const stats = statsQuery.data;
  const counters = countersQuery.data;
  const visibleSurveys = useMemo(
    () =>
      (stats?.DetalleSurveys ?? []).filter(
        ({ TotalActividades }) => !onlyInactive || TotalActividades === 0,
      ),
    [onlyInactive, stats?.DetalleSurveys],
  );
  const detailSurvey =
    stats?.DetalleSurveys.find(
      ({ SurveyID }) => SurveyID === selectedSurveyId,
    ) ?? stats?.DetalleSurveys[0];
  const detailCounter = counters?.data.find(
    ({ SurveyID }) => SurveyID === detailSurvey?.SurveyID,
  );
  const counterTotals = (counters?.data ?? []).reduce(
    (total, counter) => ({
      active: total.active + counter.TotalActivas,
      deleted: total.deleted + counter.TotalEliminadas,
      withoutLocation: total.withoutLocation + counter.ActividadesSinLocation,
      withoutAsset: total.withoutAsset + counter.ActividadesSinAsset,
    }),
    { active: 0, deleted: 0, withoutLocation: 0, withoutAsset: 0 },
  );
  const locations = (detailCounter?.Locations ?? [])
    .map(toDisplayLocation)
    .filter((location): location is DisplayLocation => location !== null);
  const inactiveLocations = (counters?.data ?? [])
    .flatMap(({ LocationsSinActividad }) => LocationsSinActividad)
    .map(toDisplayLocation)
    .filter((location): location is DisplayLocation => location !== null)
    .filter(
      (location, index, all) =>
        all.findIndex(({ id }) => id === location.id) === index,
    );

  const applyFilters = () => {
    setSelectedSurveyId(undefined);
    setAppliedFilters({
      from: dateRange[0].format('YYYY-MM-DD'),
      to: dateRange[1].format('YYYY-MM-DD'),
      ...(surveyIds.length ? { surveyIds } : {}),
    });
  };

  const refresh = () => {
    surveysQuery.refetch();
    usersQuery.refetch();
    statsQuery.refetch();
    countersQuery.refetch();
  };

  return (
    <Layout className={styles.shell}>
      <HeaderComponent
        user={currentUser}
        onLogout={startLogout}
        showAlert={() => {}}
        historyAlert={false}
      />
      <Content className={styles.content}>
        <header className={styles.pageHeader}>
          <div>
            <Typography.Text className={styles.eyebrow}>
              VISITRACK
            </Typography.Text>
            <Typography.Title level={1}>
              Dashboard de actividad
            </Typography.Title>
            <Typography.Text type="secondary">
              Monitorea formularios, usuarios y ubicaciones de tu compañía.
            </Typography.Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            loading={isFetching}
            onClick={refresh}
          >
            Actualizar
          </Button>
        </header>

        <Card className={styles.filters} bordered={false}>
          <div className={styles.filterGrid}>
            <div className={styles.filterField}>
              <span>Formularios</span>
              <Select
                mode="multiple"
                maxTagCount="responsive"
                loading={surveysQuery.isLoading}
                value={surveyIds}
                onChange={setSurveyIds}
                options={(surveysQuery.data ?? []).map(
                  ({ SurveyID, Title }) => ({
                    value: SurveyID,
                    label: `${Title} · ${SurveyID}`,
                  }),
                )}
                placeholder="Todos los formularios"
                aria-label="Seleccionar formularios"
              />
            </div>
            <div className={styles.filterField}>
              <span>Periodo del reporte</span>
              <RangePicker
                value={dateRange}
                format="DD/MM/YYYY"
                allowClear={false}
                onChange={(dates) =>
                  dates && setDateRange(dates as [Dayjs, Dayjs])
                }
                disabledDate={(date) => date.isAfter(dayjs(), 'day')}
                aria-label="Rango de fechas"
              />
            </div>
            <Button
              type="primary"
              disabled={rangeTooLong}
              onClick={applyFilters}
            >
              Aplicar filtros
            </Button>
          </div>
          <Flex className={styles.filterSummary} gap={8} wrap>
            <Button type="link" size="small" onClick={() => setSurveyIds([])}>
              Ver todos
            </Button>
            <Tag>
              {surveyIds.length
                ? `${surveyIds.length} seleccionados`
                : 'Todos los formularios'}
            </Tag>
            <Tag>
              {dateRange[0].format('DD MMM')} –{' '}
              {dateRange[1].format('DD MMM YYYY')}
            </Tag>
          </Flex>
          {rangeTooLong && (
            <Typography.Text type="danger">
              El periodo no puede superar 93 días inclusivos.
            </Typography.Text>
          )}
        </Card>

        {surveysQuery.error && (
          <Alert
            className={styles.stateAlert}
            type="warning"
            showIcon
            message="No se pudo cargar el catálogo de formularios"
            description="Puedes consultar todos los formularios o intentar actualizar el catálogo."
          />
        )}

        {counters && counters.meta.failed > 0 && (
          <Alert
            className={styles.stateAlert}
            type="warning"
            showIcon
            message={`${counters.meta.failed} de ${counters.meta.requested} formularios no pudieron cargarse`}
            description="Se muestran los resultados disponibles. Puedes intentar actualizar nuevamente."
          />
        )}

        {blockingError && (stats || counters?.data.length) && (
          <Alert
            className={styles.stateAlert}
            type="warning"
            showIcon
            message="La información está parcialmente disponible"
            description={`${errorMessage(blockingError)} Se mantienen visibles los datos recibidos.`}
          />
        )}

        {blockingError && !stats && !counters?.data.length ? (
          <Card className={styles.empty}>
            <Empty description={errorMessage(blockingError)}>
              <Button type="primary" onClick={refresh}>
                Reintentar
              </Button>
            </Empty>
          </Card>
        ) : (
          <Spin spinning={isLoading || isFetching}>
            <section className={styles.kpis} aria-label="Resumen de actividad">
              <Card>
                <Statistic
                  title="Actividades totales"
                  value={stats?.TotalActividades ?? 0}
                  prefix={<FileTextOutlined />}
                  formatter={(value) => formatNumber(Number(value))}
                />
              </Card>
              <Card>
                <Statistic
                  title="Usuarios activos / inactivos"
                  value={`${stats?.Usuarios.Activos ?? 0} / ${stats?.Usuarios.Inactivos ?? 0}`}
                  prefix={<TeamOutlined />}
                />
              </Card>
              <Card>
                <Statistic
                  title="Actividades activas"
                  value={counterTotals.active}
                  prefix={<CheckCircleOutlined />}
                  formatter={(value) => formatNumber(Number(value))}
                />
              </Card>
              <Card>
                <Statistic
                  title="Actividades eliminadas"
                  value={counterTotals.deleted}
                  prefix={<DeleteOutlined />}
                  formatter={(value) => formatNumber(Number(value))}
                />
              </Card>
              <Card>
                <Statistic
                  title="Sin location / asset"
                  value={`${counterTotals.withoutLocation} / ${counterTotals.withoutAsset}`}
                  prefix={<EnvironmentOutlined />}
                />
              </Card>
            </section>

            {!stats?.DetalleSurveys.length ? (
              <Card className={styles.empty}>
                <Empty description="No se encontró actividad para los filtros seleccionados" />
              </Card>
            ) : (
              <>
                <section className={styles.mainGrid}>
                  <Card
                    title="Actividad por formulario"
                    extra={
                      <Checkbox
                        checked={onlyInactive}
                        onChange={({ target }) =>
                          setOnlyInactive(target.checked)
                        }
                      >
                        Solo sin actividad
                      </Checkbox>
                    }
                  >
                    {visibleSurveys.length ? (
                      <div className={styles.formBars}>
                        {visibleSurveys.map((survey) => (
                          <button
                            type="button"
                            key={survey.SurveyID}
                            className={
                              survey.SurveyID === detailSurvey?.SurveyID
                                ? styles.activeBar
                                : ''
                            }
                            onClick={() => setSelectedSurveyId(survey.SurveyID)}
                          >
                            <span>
                              <strong>{survey.Title}</strong>
                              <small>SurveyID {survey.SurveyID}</small>
                            </span>
                            <span className={styles.barValue}>
                              {formatNumber(survey.TotalActividades)}{' '}
                              <small>{survey.Porcentaje.toFixed(2)}%</small>
                            </span>
                            <Progress
                              percent={survey.Porcentaje}
                              showInfo={false}
                              strokeColor="#1677ff"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No hay formularios sin actividad"
                      />
                    )}
                  </Card>

                  <Card
                    title="Actividad por usuario"
                    extra={detailSurvey && <Tag>{detailSurvey.Title}</Tag>}
                  >
                    {detailSurvey?.Usuarios.length ? (
                      <div className={styles.userSummary}>
                        <div
                          className={styles.donut}
                          role="img"
                          aria-label={`Distribución de ${detailSurvey.TotalActividades} actividades entre usuarios`}
                        >
                          <span>
                            <strong>
                              {formatNumber(detailSurvey.TotalActividades)}
                            </strong>
                            <small>actividades</small>
                          </span>
                        </div>
                        <div className={styles.userList}>
                          {detailSurvey.Usuarios.map((user, index) => (
                            <div key={user.UserID}>
                              <i className={styles[`dot${index + 1}`]} />
                              <span>
                                <strong>{user.UserName}</strong>
                                <small>UserID {user.UserID}</small>
                              </span>
                              <b>
                                {formatNumber(user.TotalActividades)}{' '}
                                <small>{user.Porcentaje.toFixed(2)}%</small>
                              </b>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Este formulario no tuvo actividad en el periodo"
                      />
                    )}
                  </Card>
                </section>

                {detailSurvey && (
                  <Card
                    className={styles.locationCard}
                    title="Desglose por ubicación"
                    extra={<Tag>SurveyID {detailSurvey.SurveyID}</Tag>}
                  >
                    <div className={styles.locationGrid}>
                      <div>
                        <Typography.Title level={5}>
                          Locations con actividad
                        </Typography.Title>
                        {locations.length ? (
                          locations.map((location) => (
                            <div
                              className={styles.locationBar}
                              key={location.id}
                              title={`${location.activities} actividades`}
                            >
                              <span>
                                <strong>{location.name}</strong>
                                <small>ID {location.id}</small>
                              </span>
                              <b>{formatNumber(location.activities)}</b>
                              <Progress
                                percent={
                                  detailCounter?.TotalActividades
                                    ? Math.round(
                                        (location.activities /
                                          detailCounter.TotalActividades) *
                                          100,
                                      )
                                    : 0
                                }
                                showInfo={false}
                                strokeColor="#001529"
                              />
                            </div>
                          ))
                        ) : (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                              detailCounter
                                ? 'Sin locations asociadas'
                                : 'Detalle no disponible'
                            }
                          />
                        )}
                      </div>
                      <div>
                        <Typography.Title level={5}>
                          Locations sin actividad
                        </Typography.Title>
                        <Table
                          size="small"
                          pagination={false}
                          rowKey="id"
                          dataSource={inactiveLocations}
                          locale={{
                            emptyText:
                              'No se reportaron locations sin actividad',
                          }}
                          columns={[
                            { title: 'LocationID', dataIndex: 'id' },
                            { title: 'Location', dataIndex: 'name' },
                            {
                              title: 'Estado',
                              render: () => (
                                <Tag color="warning">Sin actividad</Tag>
                              ),
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </Spin>
        )}

        <Alert
          className={styles.mockNotice}
          type="info"
          showIcon
          message="Detalle de respuestas"
          description="La consulta de jsonAnswers aún no está disponible en el backend. Las estadísticas mostradas provienen de endpoints agregados."
        />
      </Content>
    </Layout>
  );
};

export default DashboardPage;
