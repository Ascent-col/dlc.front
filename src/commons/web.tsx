import { useEffect, useState } from 'react';
import { notification } from 'antd';
import { io, Socket } from 'socket.io-client';
import { AlertTwoTone } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addNewAlert } from '@/store/alert/alert.feature';
import { BASE_URL } from './constants';

const WebSocketListener = () => {
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.token !== '',
  ); // Use Redux state for isAuthenticated
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      isAuthenticated &&
      currentUser?.role === 2 &&
      currentUser?.company?.id
    ) {
      const newSocket = io(BASE_URL, {
        query: { companyId: currentUser.company.id },
        transports: ['websocket'],
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        // console.log('✅ WebSocket conectado correctamente');
      });

      newSocket.on('alert', (data) => {
        dispatch(addNewAlert(data));
        notification.warning({
          message: `Alerta de ${data.fullname}`,
          description: data.date,
          placement: 'bottomRight',
          icon: <AlertTwoTone style={{ color: '#108ee9' }} />,
        });
      });

      newSocket.on('disconnect', () => {
        // console.warn('⚠️ WebSocket desconectado');
      });
    }

    // If not authenticated, disconnect the socket
    if (socket) {
      socket.disconnect();
    }
  }, [currentUser?.company?.id, currentUser?.role, isAuthenticated]);

  return null;
};

export default WebSocketListener;
