import * as React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Menu} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* redux hooks */
import {useAppDispatch, useAppSelector} from '../redux/hooks';
/* context */
import {decisionAlertContext} from '../context';
/* redux slices */
import {setIsShowMenu, setIsSignedIn, setIsAdmin} from '../redux/slices';

export const NormalMenu = () => {
  const dispatch = useAppDispatch();

  const {showDecisionAlert} = decisionAlertContext();

  const isShowMenu = useAppSelector(store => store.normalMenu.isShowMenu);

  const toggleCerrarSesion = () => {
    dispatch(setIsShowMenu(false));

    const innerCerrarSesion = () => {
      dispatch(setIsSignedIn(false));
      dispatch(setIsAdmin(false));
    };

    showDecisionAlert({
      type: 'info',
      description: '¿Desea cerrar sesion?',
      textButton: 'Cerrar sesion',
      executeFunction: () => innerCerrarSesion(),
    });
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={isShowMenu}
        onDismiss={() => dispatch(setIsShowMenu(false))}
        anchor={
          <TouchableOpacity onPress={() => dispatch(setIsShowMenu(true))}>
            <Icon name="menu" size={30} color="#fff" />
          </TouchableOpacity>
        }
        style={styles.menuContainer}>
        <Menu.Item
          onPress={toggleCerrarSesion}
          leadingIcon="logout"
          title="Cerrar sesion"
          style={styles.item}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  menuContainer: {
    marginTop: 10,
  },
  item: {
    marginTop: -8,
    marginBottom: -8,
  },
});
