import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* redux */
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {
  setArrProductAdded,
  setIsShowProductSheetEdit,
  setObjProductAdded,
} from '../redux/slices';
/* types */
import {IProductAdded} from '../common/types';
/* utils */
import {formatToMoney} from '../utils';

const ProductTable: React.FC = () => {
  const dispatch = useAppDispatch();

  const arrProductAdded = useAppSelector(
    store => store.product.arrProductAdded,
  );

  const toggleDeleteProductAdded = (productAdded: IProductAdded) => {
    const newArrProductAdded = arrProductAdded.filter(
      product => product.codigo != productAdded.codigo,
    );
    dispatch(setArrProductAdded(newArrProductAdded));
  };
  const toggleProduct = (product: IProductAdded) => {
    dispatch(setIsShowProductSheetEdit(true));
    dispatch(setObjProductAdded(product));
  };

  const emptyBoxesCount =
    arrProductAdded.length <= 4 ? 4 - arrProductAdded.length : 0;

  return (
    <View style={{borderColor: '#000', borderWidth: 0.5}}>
      {arrProductAdded.map((product, index) => (
        <TouchableOpacity
          onPress={() => toggleProduct(product)}
          style={{
            flexDirection: 'row',
            width: '100%',
            borderBottomColor: '#000',
            borderBottomWidth: 0.5,
            justifyContent: 'space-between',
          }}
          key={index}>
          <View style={{flexDirection: 'column', width: '85%', padding: 5}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={{fontWeight: 'bold'}}>{product.descrip}</Text>
              <Text>Total: {formatToMoney(product.valorTotal)}</Text>
            </View>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text>Cantidad: {product.cantidad}</Text>
              <Text>Precio: {formatToMoney(product.valorUnidad)}</Text>
              <Text>Descuento: {product.descuento}%</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => toggleDeleteProductAdded(product)}
            style={{
              backgroundColor: '#F2C0BC',
              borderColor: '#DE3A45',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 3,
              borderRadius: 5,
              borderWidth: 1,
            }}>
            <Icon name="trash-can" size={38} color={'#DE3A45'} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Renderizar las cajas vacías */}
      {[...Array(emptyBoxesCount)].map((_, index) => (
        <View
          key={`empty-${index}`}
          style={{
            flexDirection: 'row',
            width: '100%',
            minHeight: 48,
            borderBottomColor: '#000',
            borderBottomWidth: 0.5,
            justifyContent: 'space-between',
            padding: 10,
            backgroundColor: '#FFF',
          }}></View>
      ))}
    </View>
  );
};

export {ProductTable};
