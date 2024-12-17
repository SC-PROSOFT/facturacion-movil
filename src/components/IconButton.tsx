import React from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface IconButtonProps {
  iconName: string;
  iconColor: string;
  iconSize: number;
  onPress: () => void;
}

export const IconButton = ({
  iconName,
  iconColor,
  iconSize,
  onPress,
}: IconButtonProps) => {
  return (
    <TouchableOpacity
      style={{backgroundColor: '#485E8A', padding: 5, borderRadius: 5}}
      onPress={() => onPress()}>
      <Icon name={iconName} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};
