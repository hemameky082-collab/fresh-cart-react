import { useTranslation } from 'react-i18next';

export default function ErrorMsg({ errorMsg = '' }: { errorMsg?: string }) {
  const { t } = useTranslation();
  return <p className="text-red-500 text-xs mt-1">{t(errorMsg)}</p>;
}
