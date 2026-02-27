import { CSSProperties, FC } from 'react';
import {
  Avatar,
  Button,
  Col,
  ConfigProvider,
  Layout,
  Popover,
  Row,
  Typography,
  Dropdown,
  Menu,
  Badge,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { Alert, User } from '@/types';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';

const { Header } = Layout;
const { Paragraph, Text } = Typography;

type HeaderComponentProps = {
  user: User;
  onLogout: () => void;
  alertsNoRead?: Alert[];
  showAlert: ({
    id,
    iduser,
    date,
  }: {
    id: number;
    iduser: number;
    date: string;
  }) => void;
  historyNotication?: () => void;
  historyAlert: boolean;
  // detailsNotication?: (b: boolean) => void;
};

const HeaderComponent: FC<HeaderComponentProps> = ({
  user,
  onLogout,
  alertsNoRead = [],
  showAlert,
  historyNotication,
  historyAlert,
}) => {
  const { push } = useRouter();
  const stylesButtons: CSSProperties = {
    height: '100%',
    width: '100%',
    border: 'none',
    borderRadius: '0',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });
  };
  const bellAnimation = `
    @keyframes sirenFlash {
      0% { color: #DB524A; text-shadow: 0 0 5px #DB524A; }
      50% { color: #ff8b80, text-shadow: 0 0 15px #ff8b80; }
      100% { color: #DB524A; text-shadow: 0 0 5px #DB524A; }
    }`;
  const bellIconStyle: CSSProperties = {
    fontSize: '20px',
    color: alertsNoRead.length > 0 ? '#DB524A' : '#ffffff',
    animation:
      alertsNoRead.length > 0 ? 'sirenFlash 1s infinite ease-in-out' : 'none',
    transition: 'color 0.3s ease',
  };

  const notificationMenu = (
    <Menu style={{ maxHeight: '30vh', overflowY: 'auto' }}>
      <Button
        type="primary"
        style={{
          backgroundColor: '#001529',
          color: '#ffffff',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#082946')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6B7986')}
        onClick={() => historyNotication?.()}
      >
        Ver historial de alertas
      </Button>

      {alertsNoRead?.length > 0 ? (
        alertsNoRead?.map((notif, index) => (
          <div key={`${notif?.id}-${notif?.date}`}>
            <Menu.Item
              key={`${notif?.id}-${notif?.date}`}
              style={{ padding: '1em' }}
              onClick={() =>
                showAlert({
                  id: notif?.id,
                  iduser: notif?.iduser,
                  date: notif?.date,
                })
              }
            >
              <Text strong>
                <ExclamationCircleFilled
                  style={{ color: notif.status === 0 ? '#DB524A' : '#838696' }}
                />{' '}
                {notif?.fullname}
              </Text>{' '}
              <br />
              <Text style={{ color: '#A1B2D3' }}>
                {formatDate(notif?.date)}
              </Text>{' '}
            </Menu.Item>
            {index < alertsNoRead.length - 1 && (
              <Divider
                style={{
                  margin: 0,
                  padding: 0,
                  borderColor: '#001628',
                }}
              />
            )}
          </div>
        ))
      ) : (
        <Menu.Item disabled>No hay alerts</Menu.Item>
      )}
    </Menu>
  );

  const userContent = (
    <Col>
      <Paragraph>
        <Text strong>Nombre:</Text> {user?.name}
      </Paragraph>
      <Paragraph>
        <Text strong>Email:</Text> {user?.email}
      </Paragraph>
      <Paragraph>
        <Text strong>Teléfono:</Text> {user?.phone}
      </Paragraph>
      <Button type="primary" danger onClick={onLogout}>
        <LogoutOutlined style={{ paddingRight: '1vh' }} />
        Cerrar sesión
      </Button>
    </Col>
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            defaultBg: '#001529',
            defaultHoverBg: '#082946',
            colorText: '#ffffff',
            defaultHoverColor: '#9b9696',
          },
        },
      }}
    >
      <style>{bellAnimation}</style>
      <Header
        style={{
          display: 'flex',
          paddingLeft: '10px',
          paddingRight: '10px',
        }}
      >
        <Row
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Col style={{ width: '200px', height: '100%' }}>
            <Row>
              <Link href="/maps">
                <Image
                  src="/LOGODCL.png"
                  width={100}
                  height={60}
                  alt="imagen"
                  priority
                />
              </Link>
            </Row>
          </Col>

          {user?.role === 1 && (
            <Col flex="1 1 auto">
              <Row justify="start">
                <Col span={12}>
                  <Button
                    type="default"
                    size="large"
                    style={stylesButtons}
                    onClick={() => push('/maps')}
                  >
                    Mapas
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="default"
                    size="large"
                    style={stylesButtons}
                    onClick={() => push('/admin')}
                  >
                    Administrar
                  </Button>
                </Col>
              </Row>
            </Col>
          )}
          {historyAlert && (
            <Col flex="1 1 auto">
              <Row justify="start">
                <Col span={6}>
                  <Button
                    type="default"
                    size="large"
                    style={stylesButtons}
                    onClick={() => historyNotication?.()}
                  >
                    Usuarios
                  </Button>
                </Col>
              </Row>
            </Col>
          )}

          <Col style={{ width: '200px', height: '100%' }}>
            <Row
              justify="end"
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              {user?.role === 2 && (
                <Dropdown
                  dropdownRender={() => notificationMenu}
                  trigger={['click']}
                >
                  <Badge count={alertsNoRead?.length} size="small">
                    <Button
                      type="text"
                      icon={<BellOutlined style={bellIconStyle} />}
                    />
                  </Badge>
                </Dropdown>
              )}

              <Popover
                content={userContent}
                title="Detalles del Usuario"
                trigger="hover"
              >
                <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
              </Popover>
            </Row>
          </Col>
        </Row>
      </Header>
    </ConfigProvider>
  );
};

export default HeaderComponent;
