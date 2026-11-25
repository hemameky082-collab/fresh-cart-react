import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ErrorMsg from '../components/ErrorMsg';
import { useFormGroup, Validators } from '../hooks/useFormGroup';
import { forgotPassword, resetPassword, verifyResetCode } from '../services/auth.service';
import { PASSWORD_PATTERN, getPasswordStrength, passwordMatchValidator, togglePassword } from '../utils/auth';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(1);
  const mailForm = useFormGroup({ email: ['', [Validators.required, Validators.email]] });
  const codeForm = useFormGroup({ resetCode: ['', [Validators.required, Validators.minLength(6)]] });
  const newPasswordForm = useFormGroup(
    {
      password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      rePassword: ['', [Validators.required]],
    },
    [passwordMatchValidator],
  );
  const passwordStrength = getPasswordStrength(newPasswordForm.get('password').value || '');

  const sendVrifyCode = async () => {
    if (!mailForm.valid) return;
    setLoading(true);
    try {
      const res: any = await forgotPassword(mailForm.value);
      toast.success(res.message);
      setTimeout(() => {
        setLoading(false);
        setStage(2);
      }, 500);
    } catch {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!codeForm.valid) {
      codeForm.markAllAsTouched();
      return;
    }
    setLoading(true);
    try {
      const res: any = await verifyResetCode({ resetCode: codeForm.get('resetCode').value });
      toast.success(res.message);
      setTimeout(() => {
        setLoading(false);
        setStage(3);
      }, 500);
    } catch {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!newPasswordForm.valid) {
      newPasswordForm.markAllAsTouched();
      return;
    }
    setLoading(true);
    try {
      const res: any = await resetPassword({
        email: mailForm.get('email').value,
        newPassword: newPasswordForm.get('password').value,
      });
      toast.success(res.message);
      setTimeout(() => {
        setLoading(false);
        navigate('/login');
      }, 500);
    } catch {
      setLoading(false);
    }
  };

  const submit = () => {
    if (stage === 1) sendVrifyCode();
    else if (stage === 2) verifyCode();
    else if (stage === 3) updatePassword();
  };

  const goBackToFristStep = () => setStage(1);

  return (
    <>
      <div className="container py-16 mx-auto px-4" id="forgot-password-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="hidden lg:block">
            <div className="text-center space-y-6">
              <div className="w-full h-96 bg-linear-to-br from-primary-50 via-primary-50 to-emerald-50 rounded-2xl shadow-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-primary-100/50"></div>
                <div className="absolute bottom-12 right-10 w-32 h-32 rounded-full bg-primary-100/50"></div>
                <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-emerald-100/50"></div>
                <div className="relative flex flex-col items-center gap-6 z-10">
                  <div className="w-28 h-28 rounded-3xl bg-white shadow-xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
                      <svg className="svg-inline--fa fa-lock text-primary-600 text-4xl" data-prefix="fas" data-icon="lock" role="img" viewBox="0 0 384 512" aria-hidden="true">
                        <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -left-16 top-4 w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center -rotate-12">
                    <svg className="svg-inline--fa fa-envelope text-primary-500 text-xl" data-prefix="fas" data-icon="envelope" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path fill="currentColor" d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"></path>
                    </svg>
                  </div>
                  <div className="absolute -right-16 top-8 w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center rotate-12">
                    <svg className="svg-inline--fa fa-shield-halved text-primary-500 text-xl" data-prefix="fas" data-icon="shield-halved" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path fill="currentColor" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"></path>
                    </svg>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary-400 animate-pulse"></div>
                    <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse [animation-delay:150ms]"></div>
                    <div className="w-3 h-3 rounded-full bg-primary-600 animate-pulse [animation-delay:300ms]"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-800">{t('UI.RESET_YOUR_PASSWORD')}</h2>
                <p className="text-lg text-gray-600">
                  Don't worry, it happens to the best of us. We'll help you get back into your account in
                  no time.
                </p>
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="svg-inline--fa fa-envelope text-primary-600 mr-2" data-prefix="fas" data-icon="envelope" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path fill="currentColor" d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"></path></svg>{t('UI.EMAIL_VERIFICATION')}
                  </div>
                  <div className="flex items-center">
                    <svg className="svg-inline--fa fa-shield-halved text-primary-600 mr-2" data-prefix="fas" data-icon="shield-halved" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path fill="currentColor" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"></path></svg>{t('UI.SECURE_RESET')}
                  </div>
                  <div className="flex items-center">
                    <svg className="svg-inline--fa fa-lock text-primary-600 mr-2" data-prefix="fas" data-icon="lock" role="img" viewBox="0 0 384 512" aria-hidden="true">
                      <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"></path></svg>{t('UI.ENCRYPTED')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary-600">Fresh<span className="text-gray-800">Cart</span></span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('UI.FORGOT_PASSWORD')}</h1>
                <p className="text-gray-600">{t('UI.NO_WORRIES_WE_LL_SEND_YOU_A_RESET_CODE')}</p>
              </div>
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${stage === 1 ? 'ring-4 ring-primary-100' : ''} ${stage >= 1 ? 'bg-primary-600 text-white' : ''}`}>
                    {stage >= 2 ? (<>
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                        <path d="M11.8884 0.16987C12.2794 0.454245 12.3669 1.00112 12.0825 1.39214L5.08252 11.0171C4.93213 11.2249 4.69971 11.3535 4.44268 11.3753C4.18564 11.3972 3.93682 11.3015 3.75635 11.121L0.256348 7.62104C-0.0854492 7.27925 -0.0854492 6.72417 0.256348 6.38237C0.598145 6.04057 1.15322 6.04057 1.49502 6.38237L4.27041 9.15776L10.6688 0.361276C10.9532 -0.0297396 11.5001 -0.11724 11.8911 0.167135L11.8884 0.16987Z" fill="white" />
                      </svg>
                    </>) : (<>
                      <svg className="svg-inline--fa fa-envelope text-xs" data-prefix="fas" data-icon="envelope" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path fill="currentColor" d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"></path>
                      </svg>
                    </>)}
                  </div>
                  <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${stage === 2 ? 'bg-primary-200' : 'bg-gray-200'}`}></div>
                </div>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${stage === 2 ? 'ring-4 ring-primary-100' : ''} ${stage >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {stage === 3 ? (<>
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                        <path d="M11.8884 0.16987C12.2794 0.454245 12.3669 1.00112 12.0825 1.39214L5.08252 11.0171C4.93213 11.2249 4.69971 11.3535 4.44268 11.3753C4.18564 11.3972 3.93682 11.3015 3.75635 11.121L0.256348 7.62104C-0.0854492 7.27925 -0.0854492 6.72417 0.256348 6.38237C0.598145 6.04057 1.15322 6.04057 1.49502 6.38237L4.27041 9.15776L10.6688 0.361276C10.9532 -0.0297396 11.5001 -0.11724 11.8911 0.167135L11.8884 0.16987Z" fill="white" />
                      </svg>
                    </>) : (<>
                      <svg className="svg-inline--fa fa-key text-xs" data-prefix="fas" data-icon="key" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path fill="currentColor" d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0 160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17l0 80c0 13.3 10.7 24 24 24l80 0c13.3 0 24-10.7 24-24l0-40 40 0c13.3 0 24-10.7 24-24l0-40 40 0c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"></path>
                      </svg>
                    </>)}
                  </div>
                  <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${stage === 3 ? 'bg-primary-200' : 'bg-gray-200'}`}></div>
                </div>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 bg-gray-100 text-gray-400 ${stage === 3 ? 'ring-4 ring-primary-100' : ''} ${stage >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <svg className="svg-inline--fa fa-lock text-xs" data-prefix="fas" data-icon="lock" role="img" viewBox="0 0 384 512" aria-hidden="true">
                      <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              {stage === 1 || !mailForm.get('email')?.value ? (<>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">{t('UI.EMAIL_ADDRESS')}</label>
                    <div className="relative">
                      <input className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" id="email" {...mailForm.register('email')} placeholder={t('UI.ENTER_YOUR_EMAIL_ADDRESS')} type="email" name="email" /><svg className="svg-inline--fa fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" data-prefix="fas" data-icon="envelope" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path fill="currentColor" d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"></path>
                      </svg>
                    </div>
                    {mailForm.get('email')?.touched ? (<>
                      {mailForm.get('email')?.hasError('required') ? (<>
                        <ErrorMsg errorMsg={'UI.ERROR_EMAIL_REQUIRED'}></ErrorMsg>
                      </>) : null}
                      {mailForm.get('email')?.hasError('email') ? (<>
                        <ErrorMsg errorMsg={'UI.ERROR_EMAIL_INVALID'}></ErrorMsg>
                      </>) : null}
                    </>) : null}
                  </div>
                  <button className="w-full cursor-pointer bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" disabled={mailForm.invalid} type="submit">
                    {loading ? (<>
                      <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                    </>) : (<>
                      Send Reset Code
                    </>)}
                  </button>
                  <div className="text-center">
                    <Link to={'/login'} className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"><svg className="svg-inline--fa fa-arrow-left text-xs" data-prefix="fas" data-icon="arrow-left" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path></svg>{t('UI.BACK_TO_SIGN_IN')}</Link>
                  </div>
                </form>
              </>) : (stage === 2 && mailForm.get('email')?.value) || !codeForm.get('resetCode')?.value ? (<>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="resetCode">
                      {t('UI.VERIFICATION_CODE')}
                    </label>
                    <div className="relative">
                      <input className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-center text-2xl tracking-[0.5em] font-mono" {...codeForm.register('resetCode')} id="resetCode" maxLength={6} placeholder="••••••" type="text" name="resetCode" /><svg className="svg-inline--fa fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" data-prefix="fas" data-icon="shield-halved" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path fill="currentColor" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"></path>
                      </svg>
                    </div>
                    {codeForm.get('resetCode')?.touched ? (<>
                      {codeForm.get('resetCode')?.hasError('required') ? (<>
                        <ErrorMsg errorMsg={'UI.ERROR_CODE_REQUIRED'}></ErrorMsg>
                      </>) : null}
                    </>) : null}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      {t('UI.DIDN_T_RECEIVE_THE_CODE')}
                      <button className="text-primary-600 cursor-pointer hover:text-primary-700 font-semibold transition-colors" onClick={(e) => { sendVrifyCode(); }} type="button">
                        {t('UI.RESEND_CODE')}
                      </button>
                    </p>
                  </div>
                  <button className="w-full bg-primary-600 cursor-pointer text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" disabled={codeForm.invalid} type="submit">
                    {loading ? (<>
                      <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                    </>) : (<>
                      Verify Code
                    </>)}
                  </button>
                  <div className="text-center">
                    <button className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors" onClick={(e) => { goBackToFristStep(); }} type="button">
                      <svg className="svg-inline--fa fa-arrow-left text-xs" data-prefix="fas" data-icon="arrow-left" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path></svg>{t('UI.CHANGE_EMAIL_ADDRESS')}
                    </button>
                  </div>
                </form>
              </>) : stage === 3 && mailForm.get('email')?.value && codeForm.get('resetCode')?.value ? (<>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">{t('UI.NEW_PASSWORD')}</label>
                    <div className="relative">
                      <input className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" {...newPasswordForm.register('password')} id="password" placeholder={t('UI.ENTER_NEW_PASSWORD')} type="password" name="password" /><svg className="svg-inline--fa fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" data-prefix="fas" data-icon="lock" role="img" viewBox="0 0 384 512" aria-hidden="true">
                        <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"></path>
                      </svg>
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                        <div className="absolute top-1/2 cursor-pointer right-4 -translate-y-1/2" onClick={(e) => { togglePassword(e.currentTarget); }}>
                          <i className="fa-solid fa-eye-slash"></i>
                        </div>
                      </button>
                    </div>
                    {newPasswordForm.get('password')?.touched ? (<>
                      {newPasswordForm.get('password')?.hasError('required') ? (<>
                        <ErrorMsg errorMsg={'UI.ERROR_PASSWORD_REQUIRED'}></ErrorMsg>
                      </>) : null}
                      {newPasswordForm.get('password')?.hasError('pattern') ? (<>
                        <ErrorMsg errorMsg={'UI.ERROR_PASSWORD_STRENGTH'}></ErrorMsg>
                      </>) : null}
                    </>) : null}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="confirmPassword">{t('UI.CONFIRM_PASSWORD')}</label>
                    <div className="relative">
                      <input className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" {...newPasswordForm.register('rePassword')} id="confirmPassword" placeholder={t('UI.CONFIRM_NEW_PASSWORD')} type="password" name="confirmPassword" />
                      <svg className="svg-inline--fa fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" data-prefix="fas" data-icon="lock" role="img" viewBox="0 0 384 512" aria-hidden="true">
                        <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"></path>
                      </svg>
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                        <div className="absolute top-1/2 cursor-pointer right-4 -translate-y-1/2" onClick={(e) => { togglePassword(e.currentTarget); }}>
                          <i className="fa-solid fa-eye-slash"></i>
                        </div>
                      </button>
                    </div>
                  </div>
                  {newPasswordForm.get('rePassword')?.touched ? (<>
                    {newPasswordForm.get('rePassword')?.hasError('required') ? (<>
                      <ErrorMsg errorMsg={'UI.ERROR_CONFIRM_PASSWORD_REQUIRED'}></ErrorMsg>
                    </>) : null}
                    {newPasswordForm.get('rePassword')?.hasError('mismatch') ? (<>
                      <ErrorMsg errorMsg={'UI.ERROR_PASSWORD_MISMATCH'}></ErrorMsg>
                    </>) : null}
                  </>) : null}
                  <button className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" disabled={newPasswordForm.invalid} type="submit">
                    {loading ? (<>
                      <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                    </>) : (<>
                      Reset Password
                    </>)}
                  </button>
                </form>
              </>) : null}
              <div className="text-center mt-8 pt-6 border-t border-gray-100">
                <p className="text-gray-600">Remember your password? <Link to={'/login'} className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">{t('UI.SIGN_IN')}</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
