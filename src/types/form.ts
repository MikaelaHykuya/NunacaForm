export type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'yes_no';

export interface Option {
  id: string;
  label: string;
  shortcutKey?: string;
  nextQuestionId?: string; // Logic Jump
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required?: boolean;
  options?: Option[];
  nextQuestionId?: string; // Default logic jump
}

export interface FormSchema {
  id: string;
  title: string;
  questions: Question[];
  welcomeScreen?: {
    title: string;
    description: string;
    buttonText: string;
  };
  thankYouScreen?: {
    title: string;
    description: string;
  };
}
