import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  VirtualizedList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch} from '../redux/hooks';
import {IEncuesta, IPregunta} from '../common/types/IEncuesta';
import {_Checkbox} from '../components/_Checkbox';
import {_DatePicker} from '../components/_DatePicker';
import {_InputSelect} from '../components/_InputSelect';
import {_Input} from '../components/_Input';
import {Button} from 'react-native-paper';

const Survey = () => {
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();

  const survey: IEncuesta = {
    codigo: 3,
    numero_preguntas: 5,
    activar: 'S',
    preguntas: [
      {
        tipo: 'checkbox',
        pregunta_texto: 'Which features do you use the most?',
        numero_resp_cerrada: 3,
        opciones_respuesta_cerrada: ['Feature A', 'Feature B', 'Feature C'],
      },
      {
        tipo: 'multiple-choice',
        pregunta_texto: 'Do you feel valued at work?',
        numero_resp_cerrada: 2,
        opciones_respuesta_cerrada: ['Yes', 'No'],
      },
      {
        tipo: 'text',
        pregunta_texto: 'What can we improve?',
        numero_resp_cerrada: 0,
        opciones_respuesta_cerrada: [],
      },
      {
        tipo: 'rating',
        pregunta_texto: 'Rate our service',
        numero_resp_cerrada: 0,
        opciones_respuesta_cerrada: [],
      },
      {
        tipo: 'date',
        pregunta_texto: 'Select a date for your visit',
        numero_resp_cerrada: 0,
        opciones_respuesta_cerrada: [],
      },
    ],
    admin_creacion: 'admin',
    fecha_creacion: {anio: 2023, mes: 10, dia: 1},
    admin_modificacion: 'admin',
    fecha_modificacion: {anio: 2023, mes: 10, dia: 2},
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('TabNavPrincipal');
    }
  };

  const [responses, setResponses] = useState<{[key: number]: any}>({});

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
        <Text style={styles.questionRequired}>
          {item.numero_resp_cerrada > 0 ? 'Required' : 'Optional'}
        </Text>

        {item.tipo === 'text' && (
          <_Input
            placeholder="Type your answer here"
            value={responses[index] || ''}
            onChangeText={(text: string) => handleResponseChange(index, text)}
          />
        )}

        {item.tipo === 'multiple-choice' && (
          <_InputSelect
            value={responses[index] || ''}
            setValue={value => handleResponseChange(index, value)}
            values={
              item.opciones_respuesta_cerrada.map((option, idx) => ({
                label: option,
                value: idx.toString(),
              })) || []
            }
          />
        )}

        {item.tipo === 'checkbox' &&
          item.opciones_respuesta_cerrada.map((option, idx) => (
            <View key={idx} style={styles.checkboxContainer}>
              <_Checkbox
                label={option}
                status={responses[index]?.includes(option) || false}
                onPress={() => {
                  const currentResponses = responses[index] || [];
                  if (currentResponses.includes(option)) {
                    handleResponseChange(
                      index,
                      currentResponses.filter(
                        (resp: string) => resp !== option,
                      ),
                    );
                  } else {
                    handleResponseChange(index, [...currentResponses, option]);
                  }
                }}
              />
            </View>
          ))}

        {item.tipo === 'rating' && (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(rating => (
              <TouchableOpacity
                key={rating}
                style={styles.ratingButton}
                onPress={() => handleResponseChange(index, rating)}>
                <Text>{rating}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {item.tipo === 'date' && (
          <_DatePicker
            date={responses[index] || new Date()}
            setDate={date => handleResponseChange(index, date)}
          />
        )}
      </View>
    );
  };

  const getItem = (data: IPregunta[], index: number) => data[index];

  const getItemCount = (data: IPregunta[]) => data.length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Product Feature Survey</Text>
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
            onPress={() => {
              console.log(responses);
            }}
            style={styles.submitButton}>
            Submit
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
    fontWeight: 'bold',
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
});

export {Survey};