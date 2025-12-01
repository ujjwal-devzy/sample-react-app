/**
 * useForm Hook
 * Comprehensive form state management with validation
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { validateForm, type FormSchema, type FormErrors } from '../utils/validation';
import { isEqual } from '../utils/object';

// ============================================
// TYPE DEFINITIONS
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validationSchema?: FormSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface FieldInputProps<V = unknown> {
  name: string;
  value: V;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export interface FieldMeta {
  touched: boolean;
  error: string | undefined;
  isDirty: boolean;
}

export interface FieldHelpers<V = unknown> {
  setValue: (value: V) => void;
  setTouched: (touched: boolean) => void;
  setError: (error: string | undefined) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
  
  // Actions
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleReset: (nextValues?: T) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(field: K, error: string | undefined) => void;
  setFieldTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  validateField: <K extends keyof T>(field: K) => string | undefined;
  validateForm: () => FormErrors<T>;
  
  // Field helpers
  getFieldProps: <K extends keyof T>(field: K) => FieldInputProps<T[K]>;
  getFieldMeta: <K extends keyof T>(field: K) => FieldMeta;
  getFieldHelpers: <K extends keyof T>(field: K) => FieldHelpers<T[K]>;
  
  // Registration for controlled inputs
  register: <K extends keyof T>(field: K) => {
    name: string;
    value: T[K];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  };
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validationSchema,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
    onSubmit,
  } = options;

  const initialValuesRef = useRef(initialValues);
  
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
  });

  // Validate entire form
  const runValidation = useCallback(
    (values: T): FormErrors<T> => {
      if (!validationSchema) return {};
      return validateForm(values, validationSchema);
    },
    [validationSchema]
  );

  // Validate single field
  const validateFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]): string | undefined => {
      if (!validationSchema || !validationSchema[field]) return undefined;
      const singleFieldValues = { [field]: value } as unknown as T;
      const singleFieldSchema = { [field]: validationSchema[field] } as unknown as FormSchema<T>;
      const errors = validateForm(singleFieldValues, singleFieldSchema);
      return errors[field];
    },
    [validationSchema]
  );

  // Validate on mount
  useEffect(() => {
    if (validateOnMount) {
      const errors = runValidation(state.values);
      setState(prev => ({
        ...prev,
        errors,
        isValid: Object.keys(errors).length === 0,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set field value
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setState(prev => {
        const newValues = { ...prev.values, [field]: value };
        const isDirty = !isEqual(newValues, initialValuesRef.current);
        
        let newErrors = prev.errors;
        if (validateOnChange && validationSchema?.[field]) {
          const error = validateFieldValue(field, value);
          newErrors = { ...prev.errors, [field]: error };
        }

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          isDirty,
          isValid: Object.values(newErrors).every(e => !e),
        };
      });
    },
    [validateOnChange, validationSchema, validateFieldValue]
  );

  // Set field error
  const setFieldError = useCallback(
    <K extends keyof T>(field: K, error: string | undefined) => {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: error },
        isValid: Object.values({ ...prev.errors, [field]: error }).every(e => !e),
      }));
    },
    []
  );

  // Set field touched
  const setFieldTouched = useCallback(
    <K extends keyof T>(field: K, touched = true) => {
      setState(prev => {
        let newErrors = prev.errors;
        if (touched && validateOnBlur && validationSchema?.[field]) {
          const error = validateFieldValue(field, prev.values[field]);
          newErrors = { ...prev.errors, [field]: error };
        }

        return {
          ...prev,
          touched: { ...prev.touched, [field]: touched },
          errors: newErrors,
          isValid: Object.values(newErrors).every(e => !e),
        };
      });
    },
    [validateOnBlur, validationSchema, validateFieldValue]
  );

  // Set multiple values
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const isDirty = !isEqual(newValues, initialValuesRef.current);
      
      let newErrors = prev.errors;
      if (validateOnChange) {
        newErrors = runValidation(newValues);
      }

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isDirty,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, [validateOnChange, runValidation]);

  // Set errors
  const setErrors = useCallback((errors: FormErrors<T>) => {
    setState(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0,
    }));
  }, []);

  // Set touched
  const setTouched = useCallback((touched: Partial<Record<keyof T, boolean>>) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, ...touched },
    }));
  }, []);

  // Validate field
  const validateField = useCallback(
    <K extends keyof T>(field: K): string | undefined => {
      const error = validateFieldValue(field, state.values[field]);
      setFieldError(field, error);
      return error;
    },
    [state.values, validateFieldValue, setFieldError]
  );

  // Validate form
  const validateFormHandler = useCallback((): FormErrors<T> => {
    const errors = runValidation(state.values);
    setErrors(errors);
    return errors;
  }, [state.values, runValidation, setErrors]);

  // Handle submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      setState(prev => ({
        ...prev,
        isSubmitting: true,
        submitCount: prev.submitCount + 1,
      }));

      // Touch all fields
      const allTouched = Object.keys(state.values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );

      // Validate
      const errors = runValidation(state.values);
      
      setState(prev => ({
        ...prev,
        touched: allTouched,
        errors,
        isValid: Object.keys(errors).length === 0,
      }));

      if (Object.keys(errors).length > 0) {
        setState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      try {
        await onSubmit?.(state.values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    },
    [state.values, runValidation, onSubmit]
  );

  // Handle reset
  const handleReset = useCallback((nextValues?: T) => {
    const values = nextValues ?? initialValuesRef.current;
    initialValuesRef.current = values;
    
    setState({
      values,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      isDirty: false,
      submitCount: 0,
    });
  }, []);

  // Get field props
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K): FieldInputProps<T[K]> => ({
      name: String(field),
      value: state.values[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
        setFieldValue(field, value as T[K]);
      },
      onBlur: () => setFieldTouched(field, true),
    }),
    [state.values, setFieldValue, setFieldTouched]
  );

  // Get field meta
  const getFieldMeta = useCallback(
    <K extends keyof T>(field: K): FieldMeta => ({
      touched: !!state.touched[field],
      error: state.errors[field],
      isDirty: !isEqual(state.values[field], initialValuesRef.current[field]),
    }),
    [state.touched, state.errors, state.values]
  );

  // Get field helpers
  const getFieldHelpers = useCallback(
    <K extends keyof T>(field: K): FieldHelpers<T[K]> => ({
      setValue: (value: T[K]) => setFieldValue(field, value),
      setTouched: (touched: boolean) => setFieldTouched(field, touched),
      setError: (error: string | undefined) => setFieldError(field, error),
    }),
    [setFieldValue, setFieldTouched, setFieldError]
  );

  // Register function for controlled inputs
  const register = useCallback(
    <K extends keyof T>(field: K) => {
      const meta = getFieldMeta(field);
      const props = getFieldProps(field);
      
      return {
        name: props.name,
        value: props.value,
        onChange: props.onChange,
        onBlur: () => setFieldTouched(field, true),
        ...(meta.touched && meta.error && {
          'aria-invalid': true,
          'aria-describedby': `${String(field)}-error`,
        }),
      };
    },
    [getFieldProps, getFieldMeta, setFieldTouched]
  );

  return useMemo(
    () => ({
      values: state.values,
      errors: state.errors,
      touched: state.touched,
      isSubmitting: state.isSubmitting,
      isValid: state.isValid,
      isDirty: state.isDirty,
      submitCount: state.submitCount,
      handleSubmit,
      handleReset,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      setValues,
      setErrors,
      setTouched,
      validateField,
      validateForm: validateFormHandler,
      getFieldProps,
      getFieldMeta,
      getFieldHelpers,
      register,
    }),
    [
      state,
      handleSubmit,
      handleReset,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      setValues,
      setErrors,
      setTouched,
      validateField,
      validateFormHandler,
      getFieldProps,
      getFieldMeta,
      getFieldHelpers,
      register,
    ]
  );
}
