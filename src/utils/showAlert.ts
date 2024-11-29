import {setObjInfoAlert} from '../redux/slices';

import * as alertsData from './alerts.json';

export const showAlert = (codigo: string) => {
  const alerts: any = alertsData;
  let alert = alerts[codigo];

  if (alert) {
    const [description, typeAlert] = alert;
    return setObjInfoAlert({
      visible: true,
      type: typeAlert,
      description: description,
    });
  } else {
    return setObjInfoAlert({
      visible: true,
      type: 'error',
      description: 'Error inesperado, contacta al equipo de desarrollo',
    });
  }
};
