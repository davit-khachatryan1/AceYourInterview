import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

interface BaseFieldProps {
  className?: string;
}

export interface TextInputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    BaseFieldProps {}

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseFieldProps {}

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    BaseFieldProps {}

export const Input = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...props }, ref) => {
    const resolvedClassName = ['search-input', className].filter(Boolean).join(' ');
    return <input ref={ref} className={resolvedClassName} {...props} />;
  },
);

Input.displayName = 'Input';

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    const resolvedClassName = ['search-input', className].filter(Boolean).join(' ');
    return <textarea ref={ref} className={resolvedClassName} {...props} />;
  },
);

TextArea.displayName = 'TextArea';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    const resolvedClassName = ['search-input', className].filter(Boolean).join(' ');
    return <select ref={ref} className={resolvedClassName} {...props} />;
  },
);

Select.displayName = 'Select';
