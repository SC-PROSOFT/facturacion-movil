export interface ISurvey {
  id: string;
  title: string;
  description?: string;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface IQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: IOption[];
  required: boolean;
}

export interface IOption {
  id: string;
  text: string;
  checked?: boolean;
}

export type QuestionType =
  | 'text'
  | 'multiple-choice'
  | 'checkbox'
  | 'rating'
  | 'date';
