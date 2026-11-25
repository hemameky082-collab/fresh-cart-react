import { useCallback, useMemo, useRef, useState } from 'react';

// A small reactive-form helper: the same idea as Angular's FormGroup/FormControl
// (values, touched state, validators, hasError) but as a React hook.

export type Errors = Record<string, any> | null;
export type Validator = (value: any) => Errors;
export type GroupValidator = (form: FormGroupApi<any>) => Errors;

export const Validators = {
  required: ((v: any) =>
    v === null || v === undefined || v === '' || v === false || (typeof v === 'string' && v.trim() === '')
      ? { required: true }
      : null) as Validator,
  email: ((v: any) =>
    !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : { email: true }) as Validator,
  minLength: (n: number): Validator => (v) =>
    !v || String(v).length >= n ? null : { minlength: { requiredLength: n, actualLength: String(v).length } },
  maxLength: (n: number): Validator => (v) =>
    !v || String(v).length <= n ? null : { maxlength: { requiredLength: n, actualLength: String(v).length } },
  pattern: (re: RegExp): Validator => (v) => (!v || re.test(String(v)) ? null : { pattern: true }),
  min: (n: number): Validator => (v) => (v === '' || v === null || Number(v) >= n ? null : { min: true }),
  max: (n: number): Validator => (v) => (v === '' || v === null || Number(v) <= n ? null : { max: true }),
};

export interface ControlApi {
  value: any;
  touched: boolean;
  errors: Errors;
  valid: boolean;
  invalid: boolean;
  hasError: (code: string) => boolean;
  setValue: (v: any) => void;
  reset: (v?: any) => void;
  setErrors: (e: Errors) => void;
}

export interface FormGroupApi<T extends Record<string, any>> {
  value: T;
  valid: boolean;
  invalid: boolean;
  errors: Errors;
  get: (name: keyof T & string) => ControlApi;
  controls: Record<keyof T, ControlApi>;
  markAllAsTouched: () => void;
  reset: (v?: Partial<T>) => void;
  patchValue: (v: Partial<T>) => void;
  register: (name: keyof T & string, type?: 'checkbox') => any;
}

type Config<T> = { [K in keyof T]: [T[K], Validator[]?] };

export function useFormGroup<T extends Record<string, any>>(
  config: Config<T>,
  groupValidators: GroupValidator[] = [],
): FormGroupApi<T> {
  const initial = useMemo(() => {
    const o: any = {};
    Object.keys(config).forEach((k) => (o[k] = (config as any)[k][0]));
    return o as T;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const validators = useRef(config);
  validators.current = config;
  const gv = useRef(groupValidators);
  gv.current = groupValidators;

  const values = useRef<T>({ ...initial });
  const touched = useRef<Record<string, boolean>>({});
  const manual = useRef<Record<string, Errors>>({});
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);

  const controlErrors = (name: string): Errors => {
    if (manual.current[name]) return manual.current[name];
    const list = (validators.current as any)[name]?.[1] ?? [];
    let res: Record<string, any> = {};
    for (const v of list) {
      const e = v(values.current[name]);
      if (e) res = { ...res, ...e };
    }
    return Object.keys(res).length ? res : null;
  };

  const makeControl = (name: string): ControlApi => {
    const errors = controlErrors(name);
    return {
      value: values.current[name],
      touched: !!touched.current[name],
      errors,
      valid: !errors,
      invalid: !!errors,
      hasError: (code) => !!errors && code in errors,
      setValue: (v) => {
        (values.current as any)[name] = v;
        delete manual.current[name];
        rerender();
      },
      reset: (v: any = '') => {
        (values.current as any)[name] = v;
        touched.current[name] = false;
        delete manual.current[name];
        rerender();
      },
      setErrors: (e) => {
        manual.current[name] = e;
        rerender();
      },
    };
  };

  const names = Object.keys(config);
  const controls: any = {};
  names.forEach((n) => (controls[n] = makeControl(n)));

  const group: FormGroupApi<T> = {
    value: { ...values.current },
    controls,
    get: (name) => controls[name],
    get errors() {
      let res: Record<string, any> = {};
      for (const v of gv.current) {
        const e = v(group);
        if (e) res = { ...res, ...e };
      }
      return Object.keys(res).length ? res : null;
    },
    get valid() {
      return names.every((n) => !controls[n].errors) && !group.errors;
    },
    get invalid() {
      return !group.valid;
    },
    markAllAsTouched: () => {
      names.forEach((n) => (touched.current[n] = true));
      rerender();
    },
    reset: (v) => {
      names.forEach((n) => {
        (values.current as any)[n] = v && n in v ? (v as any)[n] : (initial as any)[n];
        touched.current[n] = false;
      });
      manual.current = {};
      rerender();
    },
    patchValue: (v) => {
      Object.assign(values.current, v);
      rerender();
    },
    register: (name, type) => ({
      name,
      ...(type === 'checkbox'
        ? { checked: !!values.current[name] }
        : { value: values.current[name] ?? '' }),
      onChange: (e: any) => {
        const t = e.target;
        (values.current as any)[name] = t.type === 'checkbox' ? t.checked : t.value;
        delete manual.current[name];
        rerender();
      },
      onBlur: () => {
        touched.current[name] = true;
        rerender();
      },
    }),
  };
  return group;
}
