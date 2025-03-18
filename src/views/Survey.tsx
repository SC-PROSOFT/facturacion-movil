import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  VirtualizedList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useAppSelector, useAppDispatch} from '../redux/hooks';
import {IEncuesta, IPregunta} from '../common/types/IEncuesta';
import {IRespEncuesta, IRespuestas} from '../common/types/IRespEncuesta';
import {_Input, _InputSelect} from '../components';
import {Button} from 'react-native-paper';
import {encuestaService} from '../data_queries/local_database/services';
import {setObjInfoAlert} from '../redux/slices';

const Survey = () => {
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();

  const objTercero = useAppSelector(store => store.tercerosFinder.objTercero);
  const objEncuesta = useAppSelector(store => store.encuesta.objEncuesta);
  const objOperador = useAppSelector(store => store.operator.objOperator);

  const survey: IEncuesta = objEncuesta
    ? {
        codigo: objEncuesta.codigo || '',
        nro_preguntas: objEncuesta.nro_preguntas || '',
        activar: objEncuesta.activar || 'S',
        preguntas: JSON.parse(objEncuesta.preguntas || '[]')
          .slice(0, parseInt(objEncuesta.nro_preguntas, 10))
          .map((pregunta: any) => ({
            tipo: pregunta.tipo_preg, // Usar tipo_pregunta directamente
            pregunta_texto: pregunta.preg_texto,
            numero_resp_cerrada: parseInt(pregunta.nro_resp_cerrada, 10),
            opciones_respuesta_cerrada: pregunta.opciones_resp.map(
              (opcion: any) => opcion.preg_cerrada,
            ),
          })),
        admin_creacion: objEncuesta.admin_creacion || 'admin',
        fecha_creacion: objEncuesta.fecha_creacion || '2023-10-02',
        admin_modificacion: objEncuesta.admin_modificacion || 'admin',
        fecha_modificacion: objEncuesta.fecha_modificacion || '2023-10-02',
      }
    : {
        codigo: '',
        nro_preguntas: '',
        activar: 'S',
        preguntas: [],
        admin_creacion: 'admin',
        fecha_creacion: '2023-10-02',
        admin_modificacion: 'admin',
        fecha_modificacion: '2023-10-02',
      };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('TabNavPrincipal');
    }
  };

  const initialResponses = survey.preguntas.reduce((acc, pregunta, index) => {
    acc[index] = pregunta.tipo === '2' ? '1' : '';
    return acc;
  }, {} as {[key: number]: any});

  const [responses, setResponses] = useState<{[key: number]: any}>(
    initialResponses,
  );

  const handleResponseChange = (index: number, value: any) => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [index]: value,
    }));
  };

  const renderQuestionItem = ({
    item,
    index,
  }: {
    item: IPregunta;
    index: number;
  }) => {
    return (
      <View style={styles.questionItem}>
        <Text style={styles.questionText}>{item.pregunta_texto}</Text>
        {item.tipo === '1' && (
          <_Input
            style={styles.textArea}
            numberOfLines={10}
            value={responses[index] || ''}
            onChangeText={(text: string) => handleResponseChange(index, text)}
          />
        )}

        {item.tipo === '2' && (
          <_InputSelect
            value={responses[index] || '1'}
            setValue={(value: string) => handleResponseChange(index, value)}
            values={
              item.opciones_respuesta_cerrada.map((option, idx) => ({
                label: option,
                value: (idx + 1).toString(), // Aquí aseguramos que el valor sea el texto de la opción
              })) || []
            }
          />
        )}
      </View>
    );
  };

  const getItem = (data: IPregunta[], index: number) => data[index];

  const getItemCount = (data: IPregunta[]) => data.length;

  const handleSubmit = async () => {
    const formattedResponses: IRespEncuesta = {
      codigo: survey.codigo,
      codigo_tercero: objTercero.codigo, // Reemplaza con el valor adecuado
      codigo_opera: objOperador.codigo, // Reemplaza con el valor adecuado
      respuesta: survey.preguntas.map((pregunta, index) => ({
        preg_abierta: pregunta.tipo === '1' ? responses[index] || '' : '',
        preg_cerrada: pregunta.tipo === '2' ? responses[index] || '' : '',
      })),
      admin_creacion: survey.admin_creacion,
      fecha_creacion: survey.fecha_creacion,
      admin_modificacion: survey.admin_modificacion,
      fecha_modificacion: survey.fecha_modificacion,
    };

    console.log('Respuestas:', formattedResponses);

    try {
      const response = await encuestaService.createRespEncuesta(
        formattedResponses,
      );
      if (response) {
        dispatch(
          setObjInfoAlert({
            visible: true,
            type: 'success',
            description: 'Respuestas guardadas correctamente',
          }),
        );
      }
    } catch (error) {
      console.error('Error al guardar respuestas:', error);
      dispatch(
        setObjInfoAlert({
          visible: true,
          type: 'error',
          description: 'Error al guardar respuestas',
        }),
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Encuesta general</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleBackPress}>
            <Icon
              style={styles.logoutIcon}
              name="arrow-u-left-top"
              size={28}
              color={'#FFF'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.listContent}>
          <VirtualizedList
            data={survey.preguntas}
            initialNumToRender={4}
            renderItem={({item, index}) => renderQuestionItem({item, index})}
            keyExtractor={(item, index) => index.toString()}
            getItem={getItem}
            getItemCount={getItemCount}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}>
            Guardar respuestas
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    color: '#0B2863',
    marginRight: 5,
    marginTop: 5,
  },
  title: {
    color: 'black',
    fontSize: 22,
    flex: 1,
    fontWeight: 'bold',
    marginRight: 10,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20, // Espacio entre la lista y el botón
  },
  questionItem: {
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20, // Espacio entre los elementos de la lista
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'semibold',
    marginBottom: 8,
  },
  questionRequired: {
    fontSize: 12,
    color: '#666',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  ratingButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
  },
  submitButton: {
    marginTop: 20, // Espacio entre la lista y el botón
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
});

export {Survey};
