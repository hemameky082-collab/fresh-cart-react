import type { FormGroupApi } from '../hooks/useFormGroup';

export const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Show / hide the password input that sits next to the clicked eye icon
export function togglePassword(btn: HTMLElement) {
  const input = btn.parentElement?.querySelector('input');
  const icon = btn.querySelector('i');
  if (!input || !icon) return;
  if (input.type === 'password') icon.classList.replace('fa-eye-slash', 'fa-eye');
  else icon.classList.replace('fa-eye', 'fa-eye-slash');
  input.type = input.type === 'password' ? 'text' : 'password';
}

export function passwordMatchValidator(form: FormGroupApi<any>) {
  const p = form.get('password');
  const r = form.get('rePassword');
  if (p.touched && r.touched) {
    if (!p.value || !r.value) return null;
    return p.value === r.value ? null : { mismatch: true };
  }
  return null;
}

export function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: 'UI.VERY_WEAK', color: 'bg-red-500', width: '20' },
    { label: 'UI.WEAK', color: 'bg-orange-500', width: '40' },
    { label: 'UI.MEDIUM', color: 'bg-yellow-500', width: '60' },
    { label: 'UI.STRONG', color: 'bg-blue-500', width: '80' },
    { label: 'UI.VERY_STRONG', color: 'bg-green-500', width: '100' },
  ];
  return score === 0 ? { label: 'UI.WEAK', color: 'bg-red-500', width: '0' } : levels[score - 1];
}
