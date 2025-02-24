import React from 'react';

/* react native components */
import {View, StyleSheet, ScrollView, Text} from 'react-native';

/* paper components */
import {DataTable, Modal} from 'react-native-paper';

/* components */
import {IconButton} from '.';

/* redux hooks */
import {useAppSelector, useAppDispatch} from '../redux/hooks';

/* redux slices */
import {setIsShowCarteraPopup} from '../redux/slices/carteraPopupSlice';

export const CarteraPopup = React.memo(() => {
  const dispatch = useAppDispatch();

  const isShowCarteraPopup = useAppSelector(
    store => store.carteraPopup.isShowCarteraPopup,
  );

  const arrCarteraPopup = useAppSelector(
    store => store.carteraPopup.arrCarteraPopup,
  );

  const [page, setPage] = React.useState<number>(0);
  const [numberOfItemsPerPageList] = React.useState([2, 5, 10, 20]);

  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[2],
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, arrCarteraPopup.length);

  React.useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  const closeCarteraPopup = () => {
    dispatch(setIsShowCarteraPopup(false));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginBottom: 115,
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: '#fff',
      height: '70%',
      justifyContent: 'flex-start',
    },
    dataTable: {
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    title: {
      color: '#365AC3',
    },
  });

  return (
    <Modal
      visible={isShowCarteraPopup}
      style={styles.container}
      contentContainerStyle={styles.modal}
      onDismiss={closeCarteraPopup}>
      <DataTable style={styles.dataTable}>
        <View style={{height: '90%'}}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#092254',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingLeft: 15,
            }}>
            <Text style={{color: '#FFF', fontSize: 22}}>Cartera</Text>
            <IconButton
              iconName="close"
              iconColor="#FFF"
              iconSize={25}
              onPress={() => dispatch(setIsShowCarteraPopup(false))}
            />
          </View>

          <DataTable.Header>
            <DataTable.Title textStyle={styles.title}>Sucursal</DataTable.Title>
            <DataTable.Title textStyle={styles.title}>Factura</DataTable.Title>
            <DataTable.Title textStyle={styles.title}>Fecha</DataTable.Title>
            <DataTable.Title textStyle={styles.title} numeric>
              Saldo
            </DataTable.Title>
          </DataTable.Header>

          <ScrollView>
            {arrCarteraPopup.slice(from, to).map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>
                  <Text allowFontScaling={false} style={{fontSize: 12}}>
                    {item.sucursal}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Text allowFontScaling={false} style={{fontSize: 12}}>
                    {item.nro}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Text allowFontScaling={false} style={{fontSize: 12}}>
                    {`${item.fecha.slice(0, 4)}-${item.fecha.slice(
                      4,
                      6,
                    )}-${item.fecha.slice(6, 8)}`}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  <Text allowFontScaling={false} style={{fontSize: 12}}>
                    {Number(item.vlr).toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </ScrollView>
        </View>

        <View style={{height: '10%'}}>
          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(arrCarteraPopup.length / itemsPerPage)}
            onPageChange={page => setPage(page)}
            label={`${from + 1}-${to} de ${arrCarteraPopup.length}`}
            numberOfItemsPerPageList={numberOfItemsPerPageList}
            numberOfItemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            selectPageDropdownLabel={'filas por pagina'}
          />
        </View>
      </DataTable>
    </Modal>
  );
});
