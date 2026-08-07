import React, { useEffect, useState } from 'react';
import { Layout, Button, Space, Row, Flex, message, notification } from 'antd';
import { AlertTwoTone, ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, FetchHistory, User } from '@/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import HeaderComponent from '@/commons/header';
import dayjs from 'dayjs';
import {
  listLocationsByDate,
  listLocationsPoint,
} from '@/store/location/location.feature';
import { addNewAlert, selectAlert } from '@/store/alert/alert.feature';
// import { map } from 'lodash';
import useUser from '../user/hooks/useUser';
import BoxInfo from '../mapa/commons/boxInfo';
import MapComponent from '../mapa/MapComponent';
import useLocation from '../location/hooks/useLocation';
import useAuth from '../auth/hooks/useAuth';
import useAlert from '../alert/hooks/useAlert';
// import CardAlert from '../alert/CardAlert';
import ShowUser from '../user/siderComponent/showUser';
import SelectedUser from '../user/siderComponent/selectedUser';
import SelectTripHistory from '../user/siderComponent/showSelectTrip';
import { TableAlerts } from '../alert/components/TableAlerts';
import { useSocket } from '@/socket/useSocket';
import { initSocket } from '@/socket/socket';

const { Content, Sider, Footer } = Layout;

const MainPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isAuthenticated, currentUser } = useSelector(
    (state: RootState) => state.auth,
  );
  const {
    alertsNoRead,
    changeHistoryAlert,
    historyAlert,
    sctAlert,
    // alerts,
    showAlert,
    setAlert,
  } = useAlert({
    currentUser,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPoints, setShowAllPoints] = useState(true);
  const [showTripSubmit, setshowTripSubmit] = useState(false);
  const { users, getUsersByRole } = useUser();
  const { locationsByDate, locationSelect, locationHistoryByUser } =
    useLocation();
  const [showSelectTrip, setShowSelectTrip] = useState(false);
  const [showSelectAlert, setShowSelectAlert] = useState(false);
  const { startLogout } = useAuth();
  const [showUsers, setShowUsers] = useState(true);
  const dispatch = useDispatch();
  const [siderWidth, setSiderWidth] = useState<number>(20);
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cedula.toString().includes(searchTerm),
  );
  const onSubmit = async (data: FetchHistory) => {
    try {
      const firstDate = `${dayjs(data.recorridoI).format('YYYY-MM-DD')}T00:00:00Z`;
      const lastDate = `${dayjs(data.recorridoF).format('YYYY-MM-DD')}T23:59:59Z`;
      setshowTripSubmit(true);
      const { user } = data;
      await locationHistoryByUser(firstDate, lastDate, user.toString());
    } catch (e) {
      message.error(`Error fetching user last location: ${e}`);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      initSocket(currentUser.company.id);
    }
  }, [isAuthenticated, currentUser]);

  useSocket<Alert>(
    'alert',
    (data) => {
      dispatch(addNewAlert(data));

      notification.warning({
        message: `Alerta de ${data.fullname}`,
        description: data.date,
        placement: 'bottomRight',
        icon: <AlertTwoTone style={{ color: '#108ee9' }} />,
      });
    },
    [currentUser],
  );

  useEffect(() => {
    if (sctAlert.length > 0) {
      setShowSelectAlert(true);
      setShowSelectTrip(false);
      setShowAllPoints(false);
      setSelectedUser(null);
    }
  }, [showSelectAlert, showAllPoints, showSelectTrip, showUsers, sctAlert]);

  useEffect(() => {
    if (!showSelectTrip) {
      // const fetchUsers = async () => {
      //   try {
      //     if (selectedUser && !showSelectAlert) {
      //       const res = users.find((u) => u.id === Number(selectedUser.id));
      //       setSelectedUser({
      //         ...selectedUser,
      //         lastlocation: res?.lastlocation ?? ({} as LastLocation),
      //       });
      //     }
      //   } catch (err) {
      //     setError('Failed to fetch users');
      //     return err;
      //   }
      // };
      const intervalId = setInterval(() => {
        getUsersByRole(currentUser.role);
      }, 60000);

      return () => clearInterval(intervalId);
    }
  }, [showAllPoints, showUsers, showSelectTrip, showSelectAlert]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1366) {
        setSiderWidth(15);
      } else {
        setSiderWidth(20);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ height: '100%' }}>
      <HeaderComponent
        user={currentUser}
        onLogout={startLogout}
        alertsNoRead={alertsNoRead}
        showAlert={showAlert}
        historyNotication={() => {
          changeHistoryAlert(!historyAlert);
          setAlert([]);
          setShowSelectAlert(false);
          setShowAllPoints(true);
        }}
        historyAlert={historyAlert}
      />
      <Layout className="map-body">
        <Sider
          className="map-sidebar"
          width={`${siderWidth}%`}
          style={{
            background: '#fff',
            overflow: 'auto',
            position: 'relative',
            display: !historyAlert ? 'block' : 'none',
          }}
        >
          <Space
            direction="vertical"
            style={{
              display: 'flex',
              padding: '10px',
              overflowY: 'auto',
              maxHeight: '90vh',
              paddingBottom: '30px',
            }}
          >
            <ShowUser
              showSelectTrip={showSelectTrip}
              selectedUser={selectedUser}
              showSelectAlert={showSelectAlert}
              showUsers={showUsers}
              historyAlert={historyAlert}
              filteredUsers={filteredUsers}
              setSelectedUser={setSelectedUser}
              setShowUsers={setShowUsers}
              setShowAllPoints={setShowAllPoints}
              setShowSelectAlert={setShowSelectAlert}
              changeHistoryAlert={changeHistoryAlert}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <SelectedUser
              selectedUser={selectedUser}
              showSelectTrip={showSelectTrip}
              showUsers={showUsers}
              showSelectAlert={showSelectAlert}
              historyAlert={historyAlert}
              setSelectedUser={setSelectedUser}
              setShowUsers={setShowUsers}
              setShowAllPoints={setShowAllPoints}
              setShowSelectAlert={setShowSelectAlert}
              changeHistoryAlert={changeHistoryAlert}
            />
            <SelectTripHistory
              showSelectTrip={showSelectTrip}
              selectedUser={selectedUser}
              showUsers={showUsers}
              showSelectAlert={showSelectAlert}
              historyAlert={historyAlert}
              users={users}
              locationsByDate={locationsByDate}
              onSubmit={onSubmit}
            />
            {showSelectAlert && (
              <>
                <Button
                  type="default"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    setShowAllPoints(false);
                    setSelectedUser(null);
                    setShowUsers(false);
                    dispatch(listLocationsPoint([]));
                    dispatch(listLocationsByDate([]));
                    dispatch(selectAlert([]));
                    setShowSelectAlert(false);
                    changeHistoryAlert(true);
                    setShowSelectTrip(false);
                    setshowTripSubmit(false);
                  }}
                >
                  Regresar
                </Button>
                {sctAlert && !historyAlert && (
                  <Row gutter={[8, 16]}>
                    <BoxInfo
                      span={12}
                      title="Usuario"
                      imgSrc="/usuario.png"
                      text={sctAlert[0].fullname}
                    />
                    <BoxInfo
                      span={12}
                      title="Coordenadas"
                      imgSrc="/coordenada.png"
                      text={
                        sctAlert[0]?.latitude && sctAlert[0]?.longitude
                          ? `${Number(sctAlert[0]?.latitude).toFixed(6)},
                        ${Number(sctAlert[0]?.longitude).toFixed(6)}`
                          : 'Coordenadas no disponibles'
                      }
                      googleMapsUrl={
                        sctAlert[0]?.latitude && sctAlert[0]?.longitude
                          ? `https://www.google.com/maps/search/?api=1&query=${sctAlert[0]?.latitude},${sctAlert[0]?.longitude}`
                          : '#'
                      }
                    />
                    <BoxInfo
                      span={12}
                      title="Fecha (Ult.act)"
                      imgSrc="/fecha.png"
                      text={sctAlert[0]?.date?.substring(0, 10)}
                    />
                    <BoxInfo
                      span={12}
                      title="Hora (Ult.act)"
                      imgSrc="/hora.png"
                      text={sctAlert[0]?.date?.substring(11, 19)}
                    />
                  </Row>
                )}
              </>
            )}
            {/* {historyAlert && (
              <>
                {map(alerts, (u, index) => (
                  <div
                    style={{
                      background: '#fff',
                      overflowY: 'auto',
                      maxHeight: '70vh',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '3%',
                    }}
                  >
                    <CardAlert
                      key={index}
                      alert={u}
                      onClick={() => {
                        setSelectedUser(null);
                        showAlert({
                          id: u?.id,
                          iduser: u?.iduser,
                          date: u?.date,
                        });
                        setShowUsers(false);
                        setShowAllPoints(false);
                        setShowSelectAlert(false);
                        changeHistoryAlert(false);
                      }}
                    />
                  </div>
                ))}
              </>
            )} */}
          </Space>
          <Flex
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              backgroundColor: '#001529',
            }}
          >
            {Array.from({ length: 2 }).map((_, i) => {
              const isUserButton = i === 0;

              const buttonStyles = {
                backgroundColor: '#001529',
                color: '#ffffff',
                border: '0px',
                borderRight: isUserButton ? '1px solid #ffffff' : 'none',
                width: '100%',
                height: '54px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '0px',
              };

              const handleClick = () => {
                if (isUserButton) {
                  setShowSelectTrip(false);
                  setSelectedUser(null);
                  setShowUsers(true);
                  setshowTripSubmit(false);
                  setShowAllPoints(true);
                  setShowSelectAlert(false);
                  dispatch(selectAlert([]));
                  changeHistoryAlert(false);
                } else {
                  if (selectedUser !== null) {
                    setSelectedUser(null);
                  }
                  setShowUsers(false);
                  setShowSelectTrip(true);
                  dispatch(listLocationsPoint([]));
                  dispatch(listLocationsByDate([]));
                  dispatch(selectAlert([]));
                  changeHistoryAlert(false);
                  setshowTripSubmit(false);
                  setShowSelectAlert(false);
                  setShowAllPoints(false);
                }
              };

              const buttonContent = isUserButton ? (
                <>
                  <div style={{ fontSize: 'smaller' }}>USUARIO</div>
                  <div style={{ fontSize: 'smaller' }}>(POS. ACT)</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 'smaller' }}>Reporte</div>
                  <div style={{ fontSize: 'smaller' }}>por periodos</div>
                </>
              );

              return (
                <Button
                  key={i}
                  type="default"
                  style={buttonStyles}
                  onClick={handleClick}
                >
                  <h5 style={{ margin: 0 }}>{buttonContent}</h5>
                </Button>
              );
            })}
          </Flex>
        </Sider>
        {/* <Layout style={{ padding: '0 24px 0 24px', height: '92vh' }}>
          <Content
            style={{
              padding: 10,
              margin: 0,
              minHeight: 280,
              height: '100%',
              background: '#fff',
              position: 'relative',
            }}
          >
            <MapComponent
              selectedUserNow={selectedUser}
              showTripSubmit={showTripSubmit}
              users={users}
              showAllPoints={showAllPoints}
              showSelectTrip={showSelectTrip}
              locations={locationsByDate}
              searchDateTime={locationSelect}
              showSelectAlert={showSelectAlert}
              selectAlert={sctAlert[0]}
            />
            {historyAlert && <TableAlerts />}
          </Content>
          <Footer
            style={{
              backgroundColor: '#F5F5F5',
              padding: '0',
              height: '3vh',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                color: '#001529',
                fontSize: '1em',
                fontWeight: 'lighter',
                padding: '0.2vh',
              }}
            >
              Desing by Ascent Software Solutions ©{new Date().getFullYear()}
            </h1>
          </Footer>
        </Layout> */}

        <Layout className="map-workspace" style={{ height: '100%' }}>
          <Content
            style={{
              padding: 10,
              margin: 0,
              minHeight: 280,
              height: '100%',
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                height: '100%',
              }}
            >
              <div style={{ flex: historyAlert ? '0 0 60%' : '1 1 100%' }}>
                <MapComponent
                  selectedUserNow={selectedUser}
                  showTripSubmit={showTripSubmit}
                  users={users}
                  showAllPoints={showAllPoints}
                  showSelectTrip={showSelectTrip}
                  locations={locationsByDate}
                  searchDateTime={locationSelect}
                  showSelectAlert={showSelectAlert}
                  selectAlert={sctAlert[0]}
                />
              </div>
              {historyAlert && (
                <div
                  className="alerts-table"
                  style={{
                    flex: '0 0 40%',
                    overflowY: 'auto',
                    height: '100%',
                    paddingRight: '5px',
                  }}
                >
                  <TableAlerts
                    showAlert={(alert) => {
                      setSelectedUser(null);
                      showAlert({
                        id: alert.id,
                        iduser: alert.iduser,
                        date: alert.date,
                      });
                      setShowAllPoints(false);
                    }}
                  />
                </div>
              )}
            </div>
          </Content>

          <Footer
            style={{
              backgroundColor: '#F5F5F5',
              padding: '0',
              height: '3vh',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                color: '#001529',
                fontSize: '1em',
                fontWeight: 'lighter',
                padding: '0.2vh',
              }}
            >
              Desing by Ascent Software Solutions ©{new Date().getFullYear()}
            </h1>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};
export default MainPage;
