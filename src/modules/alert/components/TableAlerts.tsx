import { RootState } from '@/store/store';
import { Alert } from '@/types';
import { ConfigProvider, Empty, Space, Table, Tag, Typography } from 'antd';
import { useSelector } from 'react-redux';

export enum AlertStatus {
  Enviada = 0,
  Recibida = 1,
  Leida = 2,
}

const AlertStatusColor: Record<number, string> = {
  [AlertStatus.Enviada]: '#fff704ff',
  [AlertStatus.Recibida]: '#32ba25ff',
  [AlertStatus.Leida]: '#1288e8ff',
};

const { Text, Title } = Typography;

const columns = [
  {
    title: 'Nombre',
    dataIndex: 'fullname',
    key: 'fullname',
    ellipsis: true,
  },
  {
    title: 'Fecha',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Hora',
    dataIndex: 'time',
    key: 'time',
    responsive: ['sm' as const],
  },
  {
    title: 'Estado',
    dataIndex: 'statusText',
    key: 'statusText',
    render: (status: string) => {
      const color =
        AlertStatusColor[AlertStatus[status as keyof typeof AlertStatus]];
      return (
        <Tag color={color} key={status}>
          {status}
        </Tag>
      );
    },
  },
  {
    title: 'Tipo Alerta',
    dataIndex: 'message',
    key: 'message',
    ellipsis: true,
  },
];

export const TableAlerts = ({
  showAlert,
}: {
  showAlert: (alert: Alert) => void;
}) => {
  const { alerts } = useSelector((state: RootState) => state.alerts);
  const alertsToShow = alerts.map((a) => {
    const [date, time] = a.date.split(' ');
    return {
      ...a,
      date,
      time,
      statusText: AlertStatus[a.status],
    };
  });
  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            cellPaddingBlockSM: 4,
          },
        },
      }}
    >
      <section className="alert-history" aria-labelledby="alert-history-title">
        <div className="alert-history__heading">
          <Space direction="vertical" size={0}>
            <Title level={4} id="alert-history-title">
              Historial de alertas
            </Title>
            <Text type="secondary">
              Selecciona una alerta para verla en el mapa
            </Text>
          </Space>
          <Tag color="blue">{alertsToShow.length} registros</Tag>
        </div>
        <Table
          bordered
          rowKey={(record) => `${record.id}-${record.date}-${record.time}`}
          dataSource={alertsToShow}
          columns={columns}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No hay alertas en el historial"
              />
            ),
          }}
          scroll={{ x: 620 }}
          onRow={(record) => {
            return {
              onClick: () => showAlert(record),
              onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  showAlert(record);
                }
              },
              tabIndex: 0,
              'aria-label': `Ver alerta de ${record.fullname}`,
              style: { cursor: 'pointer' },
            };
          }}
          pagination={{
            pageSize: 7,
            hideOnSinglePage: true,
            pageSizeOptions: [],
            size: 'small',
            showTotal: (total) => `${total} alertas`,
          }}
          size="small"
        />
      </section>
    </ConfigProvider>
  );
};
