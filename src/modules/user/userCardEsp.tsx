import React from 'react';
import { Card, Tooltip, Popconfirm, Switch } from 'antd';
import {
  EditOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import { User } from '@/types';

const { Meta } = Card;

type UserCardEspProps = {
  user: User;
  handleEditClick: (user: User) => void;
  handlePasswordClick: (user: User) => void;
  handleConfirm: (userId: number) => void;
};

const UserCardEsp: React.FC<UserCardEspProps> = ({
  user,
  handleEditClick,
  handlePasswordClick,
  handleConfirm,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasCompleteInfo = (lastlocation: Record<string, any>): boolean => {
    if (!lastlocation) return false;

    const requiredFields = [
      'id',
      'iduser',
      'latitude',
      'longitude',
      'date',
      'nomenclature',
    ];
    return requiredFields.every(
      (field) => lastlocation[field] && lastlocation[field] !== '',
    );
  };

  let color = '/recorrido/userGris.png';
  const isComplete = hasCompleteInfo(user.lastlocation);

  if (isComplete) {
    const userDateTime = new Date(user.lastlocation.date);
    const now = new Date();
    const minutesDiff = Math.round(
      (now.getTime() - userDateTime.getTime()) / (1000 * 60) -
        userDateTime.getTimezoneOffset(),
    );

    if (minutesDiff > 240) {
      color = '/recorrido/userRojo.png';
    } else if (minutesDiff > 5) {
      color = '/recorrido/userAmarillo.png';
    } else {
      color = '/recorrido/userVerde.png';
    }
  }

  return (
    <Card
      className="admin-card"
      actions={[
        <Tooltip key="edit" title="Editar Usuario">
          <EditOutlined onClick={() => handleEditClick(user)} />
        </Tooltip>,
        <Tooltip key="password" title="Cambiar contraseña">
          <LockOutlined onClick={() => handlePasswordClick(user)} />
        </Tooltip>,
        <Tooltip key="toggle" title="Deshabilitar/ habilitar usuario">
          <Popconfirm
            title="¿Estás seguro de cambiar el estado de este usuario?"
            icon={<ExclamationCircleOutlined />}
            description="Esta acción puede cambiar el estado actual del usuario"
            okText="Sí"
            cancelText="No"
            onConfirm={() => handleConfirm(user.id)}
          >
            <Switch
              checked={user.active}
              onChange={() => {}}
              style={{
                backgroundColor: user.active ? '#1890ff' : '#d9d9d9',
                borderColor: user.active ? '#1890ff' : '#d9d9d9',
              }}
            />
          </Popconfirm>
        </Tooltip>,
      ]}
    >
      <Meta
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src={color}
              alt="Status"
              width={20}
              height={20}
              style={{ marginRight: 8 }}
            />
            {`${user.name} ${user.lastname}`}
          </div>
        }
        description={user?.company?.name || 'Sin Información'}
      />
    </Card>
  );
};

export default UserCardEsp;
