import React, {useRef} from 'react';
import {Provider as StoreProvider} from 'react-redux';
import {StatusBar, View} from 'react-native';
import {MD3LightTheme as DefaultTheme, PaperProvider,} from 'react-native-paper';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';

/* store */
import {store} from './src/redux/store';
/* components */
import {InfoAlert, DecisionAlert} from './src/components';
/* navigation */
import Navigation from './src/navigation/Navigation';
/* icons */
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
/* context provider */
import GlobalProvider from './src/context/global_provider';

/* toast config */
const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{
        width: '95%',
        backgroundColor: '#E9ECF5',
        borderWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#000',
      }}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        color: '#303134',
        fontSize: 16,
        fontWeight: '600',
      }}
      renderLeadingIcon={() => {
        return (
          <View
            style={{
              backgroundColor: '#19C22A',
              justifyContent: 'center',
              alignItems: 'center',
              width: 60,
              borderRadius: 5,
            }}>
            <Icon name="check" size={40} />
          </View>
        );
      }}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      style={{
        width: '95%',
        backgroundColor: '#E9ECF5',
        borderWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#000',
      }}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        color: '#303134',
        fontSize: 16,
        fontWeight: '600',
      }}
      renderLeadingIcon={() => {
        return (
          <View
            style={{
              backgroundColor: '#365AC3',
              justifyContent: 'center',
              alignItems: 'center',
              width: 60,
              borderRadius: 5,
            }}>
            <Icon name="alert-box-outline" size={40} />
          </View>
        );
      }}
    />
  ),
  error: props => (
    <BaseToast
      {...props}
      style={{
        width: '95%',
        backgroundColor: '#E9ECF5',
        borderWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#000',
      }}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        color: '#303134',
        fontSize: 16,
        fontWeight: '600',
      }}
      renderLeadingIcon={() => {
        return (
          <View
            style={{
              backgroundColor: '#DE3A45',
              justifyContent: 'center',
              alignItems: 'center',
              width: 60,
              borderRadius: 5,
            }}>
            <Icon name="alert-box-outline" size={40} />
          </View>
        );
      }}
    />
  ),
};

/* theme */
const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#365AC3',
  },
};

const App = () => {
  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <GlobalProvider>
          <StatusBar></StatusBar>
          <Navigation></Navigation>

          <InfoAlert />
          <DecisionAlert />
          <Toast config={toastConfig} />
        </GlobalProvider>
      </PaperProvider>
    </StoreProvider>
  );
};

export default App;

//colors: #30313498 #DE3A45 #303134 #365AC3 #19C22A #E9ECF5 #E6C236 #504D54 #092254 #485E8A
