import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Реквизиты для оплаты | Миненков Вадим',
  description: 'Реквизиты для оплаты услуг физического реабилитолога ИП Миненкова Вадима',
};

export default function RequisitesPage() {
  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8">
            Реквизиты для оплаты
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 prose prose-lg max-w-none text-dark">
            <h2 className="text-xl font-semibold text-primary mt-4 mb-4">ИП Миненков Вадим</h2>
            
            <p className="mb-2"><strong>ИНН:</strong> 232002772349</p>
            <p className="mb-2"><strong>ОГРНИП:</strong> 320237500154530</p>
            <p className="mb-2"><strong>Банк:</strong> АО &quot;ТИНЬКОФФ БАНК&quot;</p>
            <p className="mb-2"><strong>БИК:</strong> 044525974</p>
            <p className="mb-2"><strong>Номер счёта:</strong> 40802810400002228160</p>
            <p className="mb-2"><strong>Корр. счёт:</strong> 30101810145250000974</p>
            <p className="mb-2"><strong>Назначение платежа:</strong> Оплата услуг по договору-оферте от [дата]</p>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Внимание!</strong> При оплате через сайт комиссия отсутствует. При оплате по реквизитам может взиматься 
                комиссия согласно тарифам Вашего банка. Пожалуйста, сохраняйте чек до окончания оказания услуг.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                После оплаты, пожалуйста, отправьте подтверждение платежа на email: 
                <a href="mailto:minenkov.rehab@yandex.ru" className="text-primary hover:underline ml-1">
                  minenkov.rehab@yandex.ru
                </a> 
                <br />
                или в Telegram: 
                <a href="https://t.me/vadim_minenkov" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                  @vadim_minenkov
                </a>
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/" className="text-primary hover:underline">
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 