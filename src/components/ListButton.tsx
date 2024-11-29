// export default ListButton;
import React, {useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {IconButton, List} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ListItem {
  iconName: string;
  iconColor: string;
  text: string;
  textColor: string;
  backgroundColor: string;
}

interface ListButtonProps {
  title: string;
  items: ListItem[];
}

export const ListButton = ({title, items}: ListButtonProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListItem>({
    iconName: '',
    iconColor: '',
    text: '',
    textColor: '',
    backgroundColor: '',
  });

  const handlePress = (item: ListItem) => {
    setSelectedItem(item);
    setExpanded(false);
  };

  const getTitle = () => {
    if (!selectedItem) {
      return title;
    } else {
      return selectedItem.text;
    }
  };

  const getIconName = () => {
    return selectedItem?.iconName || 'hand-coin'; // Reemplaza 'default-icon' con el nombre de un ícono por defecto
  };

  return (
    <View style={styles.container}>
       <Text allowFontScaling={false}
        style={{
          color: 'grey',
          fontWeight: 'bold',
          fontSize: 16,
          marginBottom: 5,
        }}>
        {title}
      </Text>

      <List.Accordion
        title={getTitle()}
        expanded={expanded}
        onPress={() => setExpanded(prevExpanded => !prevExpanded)}
        style={styles.accordion}
        titleStyle={styles.accordionTitle}
        left={props => (
          <IconButton
            {...props}
            icon={getIconName()}
            iconColor={selectedItem.iconColor || 'black'} // Error que no afecta en nada
            onPress={() => setExpanded(prevExpanded => !prevExpanded)}
          />
        )}>
        {items.map((item, index) => (
          <List.Item
            key={index}
            title={item.text}
            onPress={() => handlePress(item)}
            left={props => (
              <List.Icon
                {...props}
                icon={({color, size}) => (
                  <Icon
                    name={item.iconName}
                    color={item.iconColor}
                    size={size}
                  />
                )}
                color={item.iconColor}
              />
            )}
            titleStyle={{color: item.textColor}}
            style={{backgroundColor: item.backgroundColor}}
          />
        ))}
      </List.Accordion>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  accordion: {
    backgroundColor: '#F3f3f3',
    borderRadius: 8,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

// seria bueno reconstruir este componente - cachirre - 01-09-2023
