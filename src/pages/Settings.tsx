import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ErrorMsg from '../components/ErrorMsg';
import { useFormGroup, Validators } from '../hooks/useFormGroup';
import { changePassword, saveUserData } from '../services/auth.service';
import { useApp } from '../context/AppContext';
import type { Iuser } from '../models/iuser.interface';
import { PASSWORD_PATTERN, getPasswordStrength, passwordMatchValidator, togglePassword } from '../utils/auth';

function getUserId(): string {
  try {
    const t = localStorage.getItem('token') ?? '';
    return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).id ?? '';
  } catch {
    return '';
  }
}

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const app = useApp();
  const [userloading, setUserloading] = useState(false);
  const [passwordloading, setPasswordloading] = useState(false);
  const [user, setUser] = useState<Iuser>({} as Iuser);
  const userForm = useFormGroup({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
  });
  const changePasswordForm = useFormGroup(
    {
      currentPassword: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rePassword: ['', [Validators.required]],
    },
    [passwordMatchValidator],
  );
  const passwordStrength = getPasswordStrength(changePasswordForm.get('password').value || '');

  useEffect(() => {
    const stored = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    const u: Iuser | null = stored ? JSON.parse(stored) : null;
    if (u) {
      setUser(u);
      userForm.patchValue({ name: u.name, email: u.email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUser = async () => {
    if (!userForm.valid) {
      userForm.markAllAsTouched();
      return;
    }
    setUserloading(true);
    try {
      const res: any = await saveUserData(userForm.value);
      toast.success(res.message);
    } catch {
      /* error toast handled by the api interceptor */
    }
    setTimeout(() => setUserloading(false), 1000);
  };

  const updatePassword = async () => {
    if (!changePasswordForm.valid) {
      changePasswordForm.markAllAsTouched();
      return;
    }
    setPasswordloading(true);
    try {
      const res: any = await changePassword(changePasswordForm.value);
      toast.success(res.message);
    } catch {
      /* error toast handled by the api interceptor */
    }
    setTimeout(() => {
      app.signOut();
      setPasswordloading(false);
      navigate('/login');
    }, 1000);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t('UI.ACCOUNT_SETTINGS')}</h2>
          <p className="text-gray-500 text-sm mt-1">
            Update your profile information and change your password
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
                <svg className="svg-inline--fa fa-user text-2xl text-primary-600" data-prefix="fas" data-icon="user" role="img" viewBox="0 0 448 512" aria-hidden="true">
                  <path fill="currentColor" d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t('UI.PROFILE_INFORMATION')}</h3>
                <p className="text-sm text-gray-500">{t('UI.UPDATE_YOUR_PERSONAL_DETAILS')}</p>
              </div>
            </div>
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); updateUser(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('UI.FULL_NAME')}</label><input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" {...userForm.register('name')} placeholder={t('UI.ENTER_YOUR_NAME')} required type="text" value="Raja Reyes" />
                {userForm.get('name')?.touched ? (<>
                  {userForm.get('name')?.hasError('required') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_NAME_REQUIRED'}></ErrorMsg>
                  </>) : null}
                  {userForm.get('name')?.hasError('minlength') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_NAME_MIN_LENGTH'}></ErrorMsg>
                  </>) : null}
                </>) : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('UI.EMAIL_ADDRESS')}</label><input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" {...userForm.register('email')} placeholder={t('UI.ENTER_YOUR_EMAIL')} required type="email" value="" />
                {userForm.get('email')?.touched ? (<>
                  {userForm.get('email')?.hasError('required') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_EMAIL_REQUIRED'}></ErrorMsg>
                  </>) : null}
                  {userForm.get('email')?.hasError('email') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_EMAIL_INVALID'}></ErrorMsg>
                  </>) : null}
                </>) : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label><input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" {...userForm.register('phone')} placeholder="01xxxxxxxxx" required type="tel" value="" />
                {userForm.get('phone')?.touched ? (<>
                  {userForm.get('phone')?.hasError('required') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_PHONE_REQUIRED'}></ErrorMsg>
                  </>) : null}
                  {userForm.get('phone')?.hasError('pattern') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_PHONE_INVALID'}></ErrorMsg>
                  </>) : null}
                </>) : null}
              </div>
              <div className="pt-4">
                <button className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-lg shadow-primary-600/25" disabled={userForm.invalid} type="submit">
                  {userloading ? (<>
                    <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                    <span>{t('UI.SAVEING')}</span>
                  </>) : (<>
                    <svg className="svg-inline--fa fa-floppy-disk" data-prefix="fas" data-icon="floppy-disk" role="img" viewBox="0 0 448 512" aria-hidden="true">
                      <path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm32 96c0-17.7 14.3-32 32-32l160 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg>{t('UI.SAVE_CHANGES')}
                  </>)}
                </button>
              </div>
            </form>
          </div>
          <div className="p-6 sm:p-8 bg-gray-50">
            <h3 className="font-bold text-gray-900 mb-4">{t('UI.ACCOUNT_INFORMATION')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">User ID</span><span className="font-mono text-gray-700">{(user as any)._id ?? (user as any).id ?? getUserId()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t('UI.ROLE')}</span><span className="px-3 py-1 rounded-lg bg-primary-100 text-primary-700 font-medium capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                <svg className="svg-inline--fa fa-lock text-2xl text-amber-600" data-prefix="fas" data-icon="lock" role="img" viewBox="0 0 384 512" aria-hidden="true">
                  <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t('UI.CHANGE_PASSWORD')}</h3>
                <p className="text-sm text-gray-500">{t('UI.UPDATE_YOUR_ACCOUNT_PASSWORD')}</p>
              </div>
            </div>
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); updatePassword(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('UI.CURRENT_PASSWORD')}</label>
                <div className="relative">
                  <input className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" {...changePasswordForm.register('currentPassword')} placeholder={t('UI.ENTER_YOUR_CURRENT_PASSWORD')} required type="password" value="" /><button className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                    <div className="absolute top-1/2 cursor-pointer right-4 -translate-y-1/2" onClick={(e) => { togglePassword(e.currentTarget); }}>
                      <i className="fa-solid fa-eye-slash"></i>
                    </div>
                  </button>
                </div>
                {changePasswordForm.get('currentPassword')?.touched ? (<>
                  {changePasswordForm.get('currentPassword')?.hasError('required') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_CURRENT_PASSWORD_REQUIRED'}></ErrorMsg>
                  </>) : null}
                  {changePasswordForm.get('currentPassword')?.hasError('pattern') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_CURRENT_PASSWORD_INVALID'}></ErrorMsg>
                  </>) : null}
                </>) : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('UI.NEW_PASSWORD')}</label>
                <div className="relative">
                  <input className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" {...changePasswordForm.register('password')} placeholder={t('UI.ENTER_YOUR_NEW_PASSWORD')} required minLength={6} type="password" value="" /><button className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                    <div className="absolute top-1/2 cursor-pointer right-4 -translate-y-1/2" onClick={(e) => { togglePassword(e.currentTarget); }}>
                      <i className="fa-solid fa-eye-slash"></i>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
                {changePasswordForm.get('password')?.touched ? (<>
                  {changePasswordForm.get('password')?.hasError('required') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_PASSWORD_REQUIRED'}></ErrorMsg>
                  </>) : null}
                  {changePasswordForm.get('password')?.hasError('minlength') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_PASSWORD_STRENGTH'}></ErrorMsg>
                  </>) : null}
                </>) : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" {...changePasswordForm.register('rePassword')} placeholder={t('UI.CONFIRM_YOUR_NEW_PASSWORD')} required type="password" value="" /><button className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                    <div className="absolute top-1/2 cursor-pointer right-4 -translate-y-1/2" onClick={(e) => { togglePassword(e.currentTarget); }}>
                      <i className="fa-solid fa-eye-slash"></i>
                    </div>
                  </button>
                </div>
                {changePasswordForm.get('rePassword')?.touched ? (<>
                  {changePasswordForm.get('rePassword')?.hasError('required') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_CONFIRM_PASSWORD_REQUIRED'}></ErrorMsg>
                  </>) : null}
                  {changePasswordForm.get('rePassword')?.hasError('pattern') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_PASSWORD_MISMATCH'}></ErrorMsg>
                  </>) : null}
                </>) : null}
              </div>
              <div className="pt-4">
                <button className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-lg shadow-amber-600/25" disabled={changePasswordForm.invalid} type="submit">
                  {passwordloading ? (<>
                    <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                    <span>{t('UI.CHANGING_PASSWORD')}</span>
                  </>) : (<>
                    <svg className="svg-inline--fa fa-lock" data-prefix="fas" data-icon="lock" role="img" viewBox="0 0 384 512" aria-hidden="true">
                      <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"></path>
                    </svg>
                    Change Password
                  </>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
