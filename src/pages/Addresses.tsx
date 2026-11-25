import { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ErrorMsg from '../components/ErrorMsg';
import { useFormGroup, Validators } from '../hooks/useFormGroup';
import { addAddresse as addAddresseApi, deleteAddresse as deleteAddresseApi, getAddresses } from '../services/auth.service';
import type { Iaddress } from '../models/iaddress.interface';

const unique = (list: any[] | undefined): Iaddress[] => {
  const map = new Map<string, any>();
  (list ?? []).forEach((address: any) => {
    if (!address || !address._id) return;
    map.set(address._id, address);
  });
  return [...map.values()];
};

export default function Addresses() {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<Iaddress[]>([]);
  const [creating, setCreating] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [addressID, setAddressID] = useState('');
  const addressForm = useFormGroup({
    name: ['', [Validators.required]],
    details: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    city: ['', [Validators.required]],
  });

  useEffect(() => {
    getAddresses().then((res: any) => setAddresses(unique(res.data)));
  }, []);

  const closePopUpForm = () => {
    setOpenMenu(false);
    setAddressID('');
    addressForm.reset();
  };
  const openPopUpForm = () => setOpenMenu(true);

  const addAddresse = async () => {
    if (!addressForm.valid) {
      addressForm.markAllAsTouched();
      return;
    }
    setCreating(true);
    try {
      const res: any = await addAddresseApi(addressForm.value);
      setAddresses(unique(res.data));
      toast.success(res.message);
    } catch {
      /* error toast handled by the api interceptor */
    }
    setTimeout(() => {
      setCreating(false);
      closePopUpForm();
    }, 1000);
  };

  const editAddress = (address: Iaddress) => {
    addressForm.patchValue({ name: address.name, details: address.details, phone: address.phone, city: address.city });
    setAddressID(address._id);
    openPopUpForm();
  };

  const deleteAddresse = async (id: string) => {
    const res: any = await deleteAddresseApi(id);
    setAddresses(unique(res.data));
    toast.success(res.message);
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('UI.MY_ADDRESSES')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t('UI.MANAGE_YOUR_SAVED_DELIVERY_ADDRESSES')}</p>
          </div>
          <button className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25" onClick={(e) => { openPopUpForm(); }}>
            <svg className="svg-inline--fa fa-plus text-sm" data-prefix="fas" data-icon="plus" role="img" viewBox="0 0 448 512" aria-hidden="true">
              <path fill="currentColor" d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"></path></svg>{t('UI.ADD_ADDRESS')}
          </button>
        </div>
        {addresses.length ? (<>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((item, $index) => (<Fragment key={$index}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-200 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                      <svg className="svg-inline--fa fa-location-dot text-lg text-primary-600" data-prefix="fas" data-icon="location-dot" role="img" viewBox="0 0 384 512" aria-hidden="true">
                        <path fill="currentColor" d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.details}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M3.75288 0.586223C3.56773 0.143254 3.08491 -0.0911211 2.62554 0.0330976L2.49663 0.0682539C0.98257 0.480754 -0.31118 1.94794 0.0661635 3.73388C0.935695 7.83544 4.16304 11.0628 8.2646 11.9323C10.0529 12.312 11.5177 11.0159 11.9302 9.50185L11.9654 9.37294C12.0919 8.91122 11.8552 8.42841 11.4146 8.2456L9.13413 7.29638C8.74741 7.13466 8.29976 7.24716 8.03257 7.57294L7.12788 8.67919C5.48023 7.86122 4.15366 6.49247 3.39194 4.812L4.42788 3.96825C4.75366 3.70341 4.86382 3.25575 4.70444 2.86669L3.75288 0.586223Z" fill="currentColor" />
                          </svg>
                          {item.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
                            <path d="M7.5 0C6.67266 0 6 0.672656 6 1.5V2.25H4.875V0.5625C4.875 0.250781 4.62422 0 4.3125 0C4.00078 0 3.75 0.250781 3.75 0.5625V2.25H2.25V0.5625C2.25 0.250781 1.99922 0 1.6875 0C1.37578 0 1.125 0.250781 1.125 0.5625V2.29688C0.478125 2.46328 0 3.05156 0 3.75V10.5C0 11.3273 0.672656 12 1.5 12H12C12.8273 12 13.5 11.3273 13.5 10.5V6C13.5 5.17266 12.8273 4.5 12 4.5H10.5V1.5C10.5 0.672656 9.82734 0 9 0H7.5ZM9 2.625V3.375C9 3.58125 8.83125 3.75 8.625 3.75H7.875C7.66875 3.75 7.5 3.58125 7.5 3.375V2.625C7.5 2.41875 7.66875 2.25 7.875 2.25H8.625C8.83125 2.25 9 2.41875 9 2.625ZM8.625 4.5C8.83125 4.5 9 4.66875 9 4.875V5.625C9 5.83125 8.83125 6 8.625 6H7.875C7.66875 6 7.5 5.83125 7.5 5.625V4.875C7.5 4.66875 7.66875 4.5 7.875 4.5H8.625ZM9 7.125V7.875C9 8.08125 8.83125 8.25 8.625 8.25H7.875C7.66875 8.25 7.5 8.08125 7.5 7.875V7.125C7.5 6.91875 7.66875 6.75 7.875 6.75H8.625C8.83125 6.75 9 6.91875 9 7.125ZM11.625 6.75C11.8313 6.75 12 6.91875 12 7.125V7.875C12 8.08125 11.8313 8.25 11.625 8.25H10.875C10.6687 8.25 10.5 8.08125 10.5 7.875V7.125C10.5 6.91875 10.6687 6.75 10.875 6.75H11.625ZM6 7.125V7.875C6 8.08125 5.83125 8.25 5.625 8.25H4.875C4.66875 8.25 4.5 8.08125 4.5 7.875V7.125C4.5 6.91875 4.66875 6.75 4.875 6.75H5.625C5.83125 6.75 6 6.91875 6 7.125ZM5.625 4.5C5.83125 4.5 6 4.66875 6 4.875V5.625C6 5.83125 5.83125 6 5.625 6H4.875C4.66875 6 4.5 5.83125 4.5 5.625V4.875C4.5 4.66875 4.66875 4.5 4.875 4.5H5.625ZM3 7.125V7.875C3 8.08125 2.83125 8.25 2.625 8.25H1.875C1.66875 8.25 1.5 8.08125 1.5 7.875V7.125C1.5 6.91875 1.66875 6.75 1.875 6.75H2.625C2.83125 6.75 3 6.91875 3 7.125ZM2.625 4.5C2.83125 4.5 3 4.66875 3 4.875V5.625C3 5.83125 2.83125 6 2.625 6H1.875C1.66875 6 1.5 5.83125 1.5 5.625V4.875C1.5 4.66875 1.66875 4.5 1.875 4.5H2.625Z" fill="currentColor" />
                          </svg>
                          {item.city}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 cursor-pointer rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600 flex items-center justify-center transition-colors" onClick={(e) => { editAddress(item); }} title={t('UI.EDIT_ADDRESS')}>
                      <svg className="svg-inline--fa fa-pen text-sm" data-prefix="fas" data-icon="pen" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path fill="currentColor" d="M352.9 21.2L308 66.1 445.9 204 490.8 159.1C504.4 145.6 512 127.2 512 108s-7.6-37.6-21.2-51.1L455.1 21.2C441.6 7.6 423.2 0 404 0s-37.6 7.6-51.1 21.2zM274.1 100L58.9 315.1c-10.7 10.7-18.5 24.1-22.6 38.7L.9 481.6c-2.3 8.3 0 17.3 6.2 23.4s15.1 8.5 23.4 6.2l127.8-35.5c14.6-4.1 27.9-11.8 38.7-22.6L412 237.9 274.1 100z"></path>
                      </svg>
                    </button>
                    <button className="w-9 h-9 cursor-pointer rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-50" onClick={(e) => { deleteAddresse(item._id); }} title={t('UI.DELETE_ADDRESS')}>
                      <svg className="svg-inline--fa fa-trash text-sm" data-prefix="fas" data-icon="trash" role="img" viewBox="0 0 448 512" aria-hidden="true">
                        <path fill="currentColor" d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Fragment>))}
          </div>
        </>) : (<>
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <svg className="svg-inline--fa fa-location-dot text-3xl text-gray-400" data-prefix="fas" data-icon="location-dot" role="img" viewBox="0 0 384 512" aria-hidden="true">
                <path fill="currentColor" d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('UI.NO_ADDRESSES_YET')}</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Add your first delivery address to make checkout faster and easier.
            </p>
            <button className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25" onClick={() => { openPopUpForm(); }}><i className="fa-solid fa-plus" />Add Your First Address</button>
          </div>
        </>)}

        {openMenu ? (<>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={(e) => { closePopUpForm(); }}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200" onClick={(e) => { e.stopPropagation(); }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t('UI.ADD_NEW_ADDRESS')}</h2>
                <button className="w-9 h-9 cursor-pointer rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors" onClick={(e) => { closePopUpForm(); }}>
                  <svg className="svg-inline--fa fa-xmark" data-prefix="fas" data-icon="xmark" role="img" viewBox="0 0 384 512" aria-hidden="true">
                    <path fill="currentColor" d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"></path>
                  </svg>
                </button>
              </div>
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); addAddresse(); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('UI.ADDRESS_NAME')}</label><input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" {...addressForm.register('name')} placeholder={t('UI.E_G_HOME_OFFICE')} required type="text" value="" />
                </div>
                {addressForm.get('name')?.touched ? (<>
                  {addressForm.get('name')?.hasError('required') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_NAME_REQUIRED'}></ErrorMsg>
                  </>) : null}
                </>) : null}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('UI.FULL_ADDRESS')}</label><textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none" {...addressForm.register('details')} placeholder={t('UI.STREET_BUILDING_APARTMENT')} rows={3} required></textarea>
                </div>
                {addressForm.get('details')?.touched ? (<>
                  {addressForm.get('details')?.hasError('required') ? (<>
                    <ErrorMsg errorMsg={'UI.ERROR_ADDRESS_REQUIRED'}></ErrorMsg>
                  </>) : null}
                </>) : null}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('UI.PHONE_NUMBER')}</label><input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" {...addressForm.register('phone')} placeholder="01xxxxxxxxx" required type="tel" value="" />
                    {addressForm.get('phone')?.touched ? (<>
                      {addressForm.get('phone')?.hasError('required') ? (<>
                        <ErrorMsg errorMsg={'UI.ERROR_PHONE_REQUIRED'}></ErrorMsg>
                      </>) : null}
                      {addressForm.get('phone')?.hasError('pattern') ? (<>
                        <ErrorMsg errorMsg={'UI.ERROR_PHONE_INVALID'}></ErrorMsg>
                      </>) : null}
                    </>) : null}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('UI.CITY')}</label><input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" {...addressForm.register('city')} placeholder={t('UI.CAIRO')} required type="text" value="" />
                    {addressForm.get('city')?.touched ? (<>
                      {addressForm.get('city')?.hasError('required') ? (<>
                        <ErrorMsg errorMsg={'UI.ERROR_CITY_REQUIRED'}></ErrorMsg>
                      </>) : null}
                    </>) : null}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button className="flex-1 cursor-pointer py-3 px-6 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors" onClick={(e) => { closePopUpForm(); }} type="button">
                    {t('UI.CANCEL')}
                  </button>
                  <button className="flex-1 cursor-pointer py-3 px-6 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-lg shadow-primary-600/25" disabled={addressForm.invalid} type="submit">
                    {creating ? (<>
                      <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                      <span>{t('UI.ADDING')}</span>
                    </>) : (<>
                      Add Address
                    </>)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>) : null}
      </div>
    </>
  );
}
