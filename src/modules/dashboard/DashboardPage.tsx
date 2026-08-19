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
  BarChartOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useSelector } from 'react-redux';
import HeaderComponent from '@/commons/header';
import { RootState } from '@/store/store';
import useAuth from '@/modules/auth/hooks/useAuth';
import { dashboardSurveys } from './dashboard.mock';
import styles from './dashboard.module.scss';

const { Content } = Layout;
const { RangePicker } = DatePicker;

const formatNumber = (value: number) =>
  new Intl.NumberFormat('es-CO').format(value);

const DashboardPage = () => {
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const { startLogout } = useAuth();
  const [surveyIds, setSurveyIds] = useState<number[]>(
    dashboardSurveys.map(({ id }) => id),
  );
  const [selectedSurveyId, setSelectedSurveyId] = useState(21753);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(29, 'day'),
    dayjs(),
  ]);
  const [onlyInactive, setOnlyInactive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedSurveys = useMemo(
    () => dashboardSurveys.filter(({ id }) => surveyIds.includes(id)),
    [surveyIds],
  );
  const visibleSurveys = onlyInactive
    ? selectedSurveys.filter(({ activities }) => activities === 0)
    : selectedSurveys;
  const detailSurvey =
    selectedSurveys.find(({ id }) => id === selectedSurveyId) ??
    selectedSurveys[0];
  const totals = selectedSurveys.reduce(
    (result, survey) => ({
      activities: result.activities + survey.activities,
      active: result.active + survey.active,
      deleted: result.deleted + survey.deleted,
      withoutLocation: result.withoutLocation + survey.withoutLocation,
      withoutAsset: result.withoutAsset + survey.withoutAsset,
    }),
    {
      activities: 0,
      active: 0,
      deleted: 0,
      withoutLocation: 0,
      withoutAsset: 0,
    },
  );
  const uniqueUsers = new Set(
    selectedSurveys.flatMap(({ users }) => users.map(({ id }) => id)),
  ).size;

  const refresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 700);
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
            loading={isRefreshing}
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
                value={surveyIds}
                onChange={setSurveyIds}
                options={dashboardSurveys.map(({ id, title }) => ({
                  value: id,
                  label: `${title} · ${id}`,
                }))}
                placeholder="Selecciona formularios"
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
                aria-label="Rango de fechas"
              />
            </div>
            <Button
              type="primary"
              disabled={surveyIds.length === 0}
              onClick={refresh}
            >
              Aplicar filtros
            </Button>
          </div>
          <Flex className={styles.filterSummary} gap={8} wrap>
            <Button
              type="link"
              size="small"
              onClick={() => setSurveyIds(dashboardSurveys.map(({ id }) => id))}
            >
              Seleccionar todos
            </Button>
            <Tag>{surveyIds.length} formularios</Tag>
            <Tag>
              {dateRange[0].format('DD MMM')} –{' '}
              {dateRange[1].format('DD MMM YYYY')}
            </Tag>
          </Flex>
        </Card>

        <Spin spinning={isRefreshing}>
          <section className={styles.kpis} aria-label="Resumen de actividad">
            <Card>
              <Statistic
                title="Actividades totales"
                value={totals.activities}
                prefix={<FileTextOutlined />}
                formatter={(value) => formatNumber(Number(value))}
              />
            </Card>
            <Card>
              <Statistic
                title="Usuarios diferentes"
                value={uniqueUsers}
                prefix={<TeamOutlined />}
              />
            </Card>
            <Card>
              <Statistic
                title="Actividades activas"
                value={totals.active}
                prefix={<CheckCircleOutlined />}
                formatter={(value) => formatNumber(Number(value))}
              />
            </Card>
            <Card>
              <Statistic
                title="Actividades eliminadas"
                value={totals.deleted}
                prefix={<DeleteOutlined />}
                formatter={(value) => formatNumber(Number(value))}
              />
            </Card>
            <Card>
              <Statistic
                title="Sin location / asset"
                value={`${totals.withoutLocation} / ${totals.withoutAsset}`}
                prefix={<EnvironmentOutlined />}
              />
            </Card>
          </section>

          {selectedSurveys.length === 0 ? (
            <Card className={styles.empty}>
              <Empty description="Selecciona al menos un formulario para ver su actividad" />
            </Card>
          ) : (
            <>
              <section className={styles.mainGrid}>
                <Card
                  title="Actividad por formulario"
                  extra={
                    <Checkbox
                      checked={onlyInactive}
                      onChange={(event) =>
                        setOnlyInactive(event.target.checked)
                      }
                    >
                      Solo sin actividad
                    </Checkbox>
                  }
                >
                  {visibleSurveys.length ? (
                    <div className={styles.formBars}>
                      {visibleSurveys.map((survey) => {
                        const percentage = totals.activities
                          ? Math.round(
                              (survey.activities / totals.activities) * 100,
                            )
                          : 0;
                        return (
                          <button
                            type="button"
                            key={survey.id}
                            className={
                              survey.id === detailSurvey?.id
                                ? styles.activeBar
                                : ''
                            }
                            onClick={() => setSelectedSurveyId(survey.id)}
                          >
                            <span>
                              <strong>{survey.title}</strong>
                              <small>SurveyID {survey.id}</small>
                            </span>
                            <span className={styles.barValue}>
                              {formatNumber(survey.activities)}{' '}
                              <small>{percentage}%</small>
                            </span>
                            <Progress
                              percent={percentage}
                              showInfo={false}
                              strokeColor="#1677ff"
                            />
                          </button>
                        );
                      })}
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
                  extra={detailSurvey && <Tag>{detailSurvey.title}</Tag>}
                >
                  {detailSurvey?.users.length ? (
                    <div className={styles.userSummary}>
                      <div
                        className={styles.donut}
                        role="img"
                        aria-label={`Distribución de ${detailSurvey.activities} actividades entre usuarios`}
                      >
                        <span>
                          <strong>
                            {formatNumber(detailSurvey.activities)}
                          </strong>
                          <small>actividades</small>
                        </span>
                      </div>
                      <div className={styles.userList}>
                        {detailSurvey.users.map((user, index) => {
                          const percentage = Math.round(
                            (user.activities / detailSurvey.activities) * 100,
                          );
                          return (
                            <div key={user.id}>
                              <i className={styles[`dot${index + 1}`]} />
                              <span>
                                <strong>{user.name}</strong>
                                <small>UserID {user.id}</small>
                              </span>
                              <b>
                                {formatNumber(user.activities)}{' '}
                                <small>{percentage}%</small>
                              </b>
                            </div>
                          );
                        })}
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
                  extra={<Tag>SurveyID {detailSurvey.id}</Tag>}
                >
                  <div className={styles.locationGrid}>
                    <div>
                      <Typography.Title level={5}>
                        Locations con actividad
                      </Typography.Title>
                      {detailSurvey.locations.length ? (
                        detailSurvey.locations.map((location) => (
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
                              percent={Math.round(
                                (location.activities /
                                  detailSurvey.activities) *
                                  100,
                              )}
                              showInfo={false}
                              strokeColor="#001529"
                            />
                          </div>
                        ))
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Sin locations asociadas"
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
                        dataSource={detailSurvey.locationsWithoutActivity}
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

              <Card
                className={styles.tableCard}
                title="Detalle de formularios"
                extra={<BarChartOutlined />}
              >
                <Table
                  rowKey="id"
                  dataSource={selectedSurveys}
                  scroll={{ x: 720 }}
                  pagination={{ pageSize: 5, hideOnSinglePage: true }}
                  columns={[
                    { title: 'Formulario', dataIndex: 'title' },
                    { title: 'SurveyID', dataIndex: 'id', width: 110 },
                    {
                      title: 'Total',
                      dataIndex: 'activities',
                      sorter: (a, b) => a.activities - b.activities,
                    },
                    { title: 'Activas', dataIndex: 'active' },
                    { title: 'Eliminadas', dataIndex: 'deleted' },
                    {
                      title: 'Usuarios',
                      render: (_, survey) => survey.users.length,
                    },
                    {
                      title: 'Estado',
                      render: (_, survey) =>
                        survey.activities ? (
                          <Tag color="success">Con actividad</Tag>
                        ) : (
                          <Tag color="warning">Sin actividad</Tag>
                        ),
                    },
                  ]}
                />
              </Card>
            </>
          )}
        </Spin>

        <Alert
          className={styles.mockNotice}
          type="info"
          showIcon
          message="Vista en validación"
          description="Los datos mostrados son demostrativos. La integración con Visitrack se conectará en una segunda fase."
        />
      </Content>
    </Layout>
  );
};

export default DashboardPage;
