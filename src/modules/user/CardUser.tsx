import React from 'react';
import { Card } from 'antd';
import type { User } from '@/types';
import { isEqual } from 'lodash';
import Image from 'next/image';
import styles from '@/styles/MapComponent.module.css';

type CardUserProps = {
  user: User;
  onClick: (user: User) => void;
};

const CardUser: React.FC<CardUserProps> = ({ user, onClick }) => {
  const haveLastLocation = !isEqual(user.lastlocation, null);
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

  let color = '/recorrido/gris.png';

  const lastLocationDate = user.lastlocation?.date || null;

  const isComplete = hasCompleteInfo(user.lastlocation);

  if (user.hasAlert) {
    color = '';
  } else if (isComplete) {
    const userDateTimeMoment = new Date(user.lastlocation.date);
    const nowMoment = new Date();
    const minutesDiff = Math.round(
      (nowMoment.getTime() - userDateTimeMoment.getTime()) / (1000 * 60) -
        userDateTimeMoment.getTimezoneOffset(),
    );

    if (minutesDiff > 240) {
      color = '/recorrido/rojo.png';
    } else if (minutesDiff > 5) {
      color = '/recorrido/amarillo.png';
    } else {
      color = '/recorrido/verde.png';
    }
  }

  return (
    <Card
      hoverable={lastLocationDate !== null}
      onClick={() => (lastLocationDate ? onClick(user) : null)}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {}
          {color === '' ? (
            <div
              className={styles['sos-blink']}
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: 'red',
                borderRadius: '50%',
                marginRight: '10px',
                marginLeft: '4px',
              }}
            />
          ) : (
            <Image
              src={color}
              alt="Status"
              width={20}
              height={20}
              style={{ marginRight: 8 }}
            />
          )}
          {`${user.name} ${user.lastname}`}
        </div>
      }
      id={user.cedula.toString()}
      style={{
        backgroundColor: haveLastLocation ? undefined : '#DAE0E0',
        marginBottom: '1vh',
      }}
      size="small"
    >
      <p>
        Ult.act:
        {lastLocationDate
          ? ` ${lastLocationDate.substring(0, 10)}`
          : ' Sin Información'}
      </p>
      <p>
        Hora:
        {lastLocationDate
          ? ` ${lastLocationDate.substring(11, 16)}`
          : ' Sin Información'}
      </p>
      <p>
        Version Mobile:{' '}
        {user.mobileVersion ? ` ${user.mobileVersion}` : ' Sin Información'}
      </p>
    </Card>
  );
};

export default CardUser;
