import NetInfo from '@react-native-community/netinfo';

export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error('Error checking internet connection:', error);
    return false;
  }
};