import React, {useState, useEffect} from 'react';
import DeviceInfo from 'react-native-device-info';

import {
  View,
  Image,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {Text} from 'react-native-paper';

/* components */
import {
  StandardInput,
  PasswordInput,
  NormalButton,
  NormalCheckbox,
} from '../components';
/* local database config */
import {createTables} from '../data_queries/local_database/local_database_config';
/* local database services */
import {
  operadoresService,
  rememberAccountService,
} from '../data_queries/local_database/services';
/* hooks redux */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* slices redux */

import {
  setIsAdmin,
  setIsSignedIn,
  setObjOperator,
  setObjInfoAlert,
} from '../redux/slices';
/* utils */
import {showAlert} from '../utils/showAlert';
import {getPermissions} from '../utils/getPermissions';
/* common types */
import {IOperadores} from '../common/types';
/* local types */
interface userInfo {
  user: string;
  password: string;
}

interface FormProps {
  inputs: {
    user: string;
    password: string;
  };
  checkboxes: {
    rememberAccount: boolean;
  };
  handleInputChange: (input: string, text: string) => void;
  pressNormalCheckbox: Function;
  pressLoginButton: Function;
}

// Obtener las dimensiones de la pantalla
const {width} = Dimensions.get('window');

// Función para calcular el tamaño de la fuente basado en el ancho del dispositivo
const scaleFontSize = (size: number) => (width / 375) * size;

const Form = ({
  inputs,
  checkboxes,
  handleInputChange,
  pressNormalCheckbox,
  pressLoginButton,
}: FormProps) => {
  const {user, password} = inputs;
  const {rememberAccount} = checkboxes;

  const formStyles = StyleSheet.create({
    formContainer: {},
    rememberAccountContainer: {
      flexDirection: 'row',
    },
    rememberAccountText: {
      color: '#000',
    },
  });

  return (
    <View style={formStyles.formContainer}>
      <StandardInput
        value={user}
        label="Usuario"
        name="user"
        mode="outlined"
        keyboardType="default"
        onChange={handleInputChange}
      />

      <PasswordInput
        value={password}
        label="Contrasena"
        name="password"
        handleInputChange={handleInputChange}
      />

      <NormalCheckbox
        label="Recordar Usuario"
        checkboxName="rememberAccount"
        checked={rememberAccount}
        pressNormalCheckbox={pressNormalCheckbox}
      />

      <NormalButton
        value="Iniciar sesion"
        pressNormalButton={pressLoginButton}
      />
    </View>
  );
};

const Footer = ({appVersion}: {appVersion: string}) => {
  const footerStyles = StyleSheet.create({
    footerText: {
      color: '#303134',
      fontSize: 15,
    },
    footerVersionApp: {
      color: '#303134',
      fontSize: 15,
    },
  });

  return (
    <>
      <Text allowFontScaling={false} style={footerStyles.footerText}>
        © 2023 PROSOFT Versión {appVersion}
      </Text>
    </>
  );
};

const Login = () => {
  const dispatch = useAppDispatch();

  const objOperador = useAppSelector(store => store.operator.objOperator);

  const [inputs, setInputs] = useState({
    user: '',
    password: '',
  });

  const [checkboxes, setCheckboxes] = useState({
    rememberAccount: false,
  });

  const [showLogo, setShowLogo] = useState<boolean>(true);

  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    fetchAppVersion();
    adjustScreenSize();
    initDb();
    getPermissions();
  }, []);

  const handleInputChange = (name: string, text: string) => {
    setInputs(prevState => ({...prevState, [name]: text}));
  };
  const pressNormalCheckbox = (checkboxName: string, checked: boolean) => {
    setCheckboxes(prevState => ({...prevState, [checkboxName]: checked}));
  };
  const pressLoginButton = async () => {
    const {rememberAccount} = checkboxes;
    const {user, password} = inputs;

    const accountAndPassword = {
      user,
      password,
    };

    if (user == '99') {
    } else if (rememberAccount) {
      const resGetRememberAccount =
        await rememberAccountService.getRememberAccount();

      resGetRememberAccount &&
        (await rememberAccountService.updateRememberAccount(
          resGetRememberAccount.user,
          accountAndPassword,
        ));

      !resGetRememberAccount &&
        (await rememberAccountService.createRememberAccount(
          accountAndPassword,
        ));
    } else {
      await rememberAccountService.deleteTableRememberAccount();
    }

    login({user, password});
  };
  const login = async ({user, password}: userInfo) => {
    const operadores = await operadoresService.getAllOperadores();

    if (user == '99' && password == '641218') {
      dispatch(
        setObjOperator({
          ...objOperador,
          descripcion: 'Usuario administrador',
        }),
      );
      dispatch(setIsAdmin(true));
    } else if (
      operadores.find(
        operador => operador.codigo == user && operador.clave == password,
      )
    ) {
      const operador: IOperadores = operadores.find(
        (operador: IOperadores) =>
          operador.codigo === user && operador.clave === password,
      ) ?? {
        codigo: '',
        descripcion: '',
        clave: '',
        id: '',
        cod_vendedor: '',
        sucursal: '',
        nro_pedido: 0,
        nro_factura: 0,
        auto_dian: '',
        fecha_ini: '',
        fecha_fin: '',
        nro_ini: '',
        nro_fin: '',
        prefijo: '',
        vigencia: '',
      };

      dispatch(
        setObjOperator({
          ...operador,
          nro_pedido: Number(operador.nro_pedido),
          nro_factura: Number(operador.nro_factura),
        }),
      );

      dispatch(setIsSignedIn(true));
    } else {
      dispatch(showAlert('00'));
    }
  };
  const initDb = async () => {
    await createTables();

    loadRememberedAccount();
  };
  const loadRememberedAccount = async () => {
    const rememberAccount = await rememberAccountService.getRememberAccount();

    if (!!rememberAccount) {
      const {user, password} = rememberAccount;

      setInputs({user, password});
      setCheckboxes({rememberAccount: true});
    } else {
      setCheckboxes({rememberAccount: false});
    }
  };
  const adjustScreenSize = () => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setShowLogo(false);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setShowLogo(true);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  };
  const fetchAppVersion = () => {
    const version = DeviceInfo.getVersion();
    setAppVersion(version);
  };

  const loginStyles = StyleSheet.create({
    container: {
      backgroundColor: '#E9ECF5',
      flex: 1,
    },
    pensadorContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '35%',
    },
    titleContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: showLogo ? 0 : 40,
      height: showLogo ? '5%' : '10%',
    },
    formContainer: {
      width: '100%',
      height: '45%',
      paddingHorizontal: 20,
    },
    footerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: showLogo ? '15%' : '30%',
      paddingBottom: 3,
    },
    pensadorBorder: {
      backgroundColor: '#FDFDFD',
      width: 150,
      height: 200,
      borderRadius: 10,
      elevation: 5,
    },
    pensador: {
      width: '100%',
      height: '100%',
    },

    title1: {
      fontWeight: 'bold',
      color: '#303134',
      fontSize: scaleFontSize(21),
    },
    title2: {
      fontWeight: 'bold',
      color: '#365AC3',
      fontSize: scaleFontSize(21),
      marginLeft: 7,
    },
  });

  return (
    <KeyboardAvoidingView behavior={'height'} style={{flex: 1}}>
      <SafeAreaView style={loginStyles.container}>
        {showLogo && (
          <View style={loginStyles.pensadorContainer}>
            <View style={loginStyles.pensadorBorder}>
              <Image
                source={require('../../assets/pensador.png')}
                style={loginStyles.pensador}
              />
            </View>
          </View>
        )}

        <View style={loginStyles.titleContainer}>
          <Text allowFontScaling={false} style={loginStyles.title1}>
            Ingresa a
          </Text>
          <Text allowFontScaling={false} style={loginStyles.title2}>
            Pedidos
          </Text>
        </View>

        <View style={loginStyles.formContainer}>
          <Form
            inputs={inputs}
            checkboxes={checkboxes}
            handleInputChange={handleInputChange}
            pressNormalCheckbox={pressNormalCheckbox}
            pressLoginButton={pressLoginButton}
          />
        </View>

        <View style={loginStyles.footerContainer}>
          <Footer appVersion={appVersion}></Footer>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export {Login};
