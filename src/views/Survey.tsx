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
import {ISurvey, IQuestion} from '../common/types/ISurvey';
import {_Checkbox} from '../components/_Checkbox';
import {_DatePicker} from '../components/_DatePicker';
import {_InputSelect} from '../components/_InputSelect';
import {_Input} from '../components/_Input';

const Survey = () => {
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();

  const survies: ISurvey = {
    id: '3',
    title: 'Product Feature Survey',
    createdAt: new Date(),
    questions: [
      {
        id: 'q1',
        text: 'Which features do you use the most?',
        type: 'checkbox',
        required: true,
        options: [
          {id: 'o1', text: 'Feature A', checked: false},
          {id: 'o2', text: 'Feature B', checked: false},
          {id: 'o3', text: 'Feature C', checked: false},
        ],
      },
      {
        id: 'q2',
        text: 'Do you feel valued at work?',
        type: 'multiple-choice',
        required: true,
        options: [
          {id: 'o1', text: 'Yes'},
          {id: 'o2', text: 'No'},
        ],
      },
      {
        id: 'q3',
        text: 'What can we improve?',
        type: 'text',
        required: false,
      },
      {
        id: 'q4',
        text: 'Rate our service',
        type: 'rating',
        required: true,
      },
      {
        id: 'q5',
        text: 'Select a date for your visit',
        type: 'date',
        required: true,
      },
      {
        id: 'q6',
        text: 'Select a date for your visit',
        type: 'date',
        required: true,
      },
      {
        id: 'q7',
        text: 'Select a date for your visit',
        type: 'date',
        required: true,
      },
    ],
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('TabNavPrincipal');
    }
  };

  const renderQuestionItem = ({
    item,
    selectedDate,
    setSelectedDate,
    selectedValue,
    setSelectedValue,
    checkboxStatus,
    setCheckboxStatus,
  }: {
    item: IQuestion;
    selectedDate: Date;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
    selectedValue: string;
    setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
    checkboxStatus: boolean;
    setCheckboxStatus: React.Dispatch<React.SetStateAction<boolean>>;
  }) => (
    <View style={styles.questionItem}>
      <Text style={styles.questionText}>{item.text}</Text>
      <Text style={styles.questionRequired}>
        {item.required ? 'Required' : 'Optional'}
      </Text>

      {item.type === 'text' && <_Input placeholder="Type your answer here" />}

      {item.type === 'multiple-choice' && (
        <_InputSelect
          value={selectedValue}
          setValue={setSelectedValue}
          values={
            item.options?.map(option => ({
              label: option.text,
              value: option.id,
            })) || []
          }
        />
      )}

      {item.type === 'checkbox' &&
        item.options?.map(option => (
          <View key={option.id} style={styles.checkboxContainer}>
            <_Checkbox
              label={option.text}
              status={checkboxStatus}
              onPress={setCheckboxStatus}
            />
          </View>
        ))}

      {item.type === 'rating' && (
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map(rating => (
            <TouchableOpacity key={rating} style={styles.ratingButton}>
              <Text>{rating}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {item.type === 'date' && (
        <_DatePicker date={selectedDate} setDate={setSelectedDate} />
      )}
    </View>
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedValue, setSelectedValue] = useState('');
  const [checkboxStatus, setCheckboxStatus] = useState(false);

  const getItem = (data: IQuestion[], index: number) => data[index];

  const getItemCount = (data: IQuestion[]) => data.length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{survies.title}</Text>
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
        <Text style={styles.surveyDescription}>{survies.description}</Text>
        <VirtualizedList
          data={survies.questions}
          initialNumToRender={4}
          renderItem={({item}) =>
            renderQuestionItem({
              item,
              selectedDate,
              setSelectedDate,
              selectedValue,
              setSelectedValue,
              checkboxStatus,
              setCheckboxStatus,
            })
          }
          keyExtractor={item => item.id}
          getItem={getItem}
          getItemCount={getItemCount}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingBottom: 120, // Ajusta el padding inferior para evitar que se corte
  },
  surveyDescription: {
    fontSize: 14,
    color: '#666',
  },
  questionItem: {
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
});

export {Survey};
