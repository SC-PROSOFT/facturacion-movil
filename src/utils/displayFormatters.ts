// src/utils/displayFormatters.ts (Ejemplo)
import {IProductAdded} from '../common/types';

const PLACEHOLDER_TEXT = '***** ***** ***** *****';
const OBSERVATION_TRUNCATE_LENGTH = 26;

export const formatName = (name?: string): string => {
  return name && name.trim() !== '' ? name : PLACEHOLDER_TEXT;
};

export const formatAddress = (address?: string): string => {
  return address && address.trim() !== '' ? address : PLACEHOLDER_TEXT;
};

export const formatObservation = (observation?: string): string => {
  if (!observation || observation.trim() === '') {
    return '';
  }
  return observation.length > OBSERVATION_TRUNCATE_LENGTH
    ? `${observation.slice(0, OBSERVATION_TRUNCATE_LENGTH).trim()}...`
    : observation;
};

export const calculateTotalOperationValue = (
  items: IProductAdded[] = [],
): number => {
  return items.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
};
