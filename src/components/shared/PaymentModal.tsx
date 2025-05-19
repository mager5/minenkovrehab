import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef, useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPhoneNumber(value: string) {
  // Маска +7 (XXX) XXX-XX-XX
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (!digits.startsWith('7')) digits = '7' + digits;
  let formatted = '+7';
  if (digits.length > 1) formatted += ' (' + digits.slice(1, 4);
  if (digits.length >= 4) formatted += ') ' + digits.slice(4, 7);
  if (digits.length >= 7) formatted += '-' + digits.slice(7, 9);
  if (digits.length >= 9) formatted += '-' + digits.slice(9, 11);
  return formatted.slice(0, 18);
}

const PaymentModal = ({ isOpen, onClose }: PaymentModalProps) => {
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ email: '', phone: '' });
      setSubmitError(null);
      setIsSubmitting(false);
      setConsentChecked(false);
    }
  }, [isOpen]);

  const initialFocusRef = useRef(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFocus = (field: string) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsentChecked(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const amount = 2950;
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, phone: formData.phone, amount }),
      });
      const data = await response.json();
      if (data.PaymentURL) {
        window.location.href = data.PaymentURL;
      } else {
        setSubmitError(data.error?.Message || data.error || 'Ошибка оплаты');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Ошибка оплаты');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={onClose} initialFocus={initialFocusRef}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>
        <div className="flex items-center justify-center min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-8 shadow-lg transition-all duration-500 border border-gray-100 relative">
              <button
                type="button"
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 z-10"
                onClick={onClose}
                aria-label="Закрыть"
              >
                <IoMdClose className="h-5 w-5 text-gray-700" />
              </button>
              <Dialog.Title
                as="h2"
                className="text-2xl font-bold text-primary mb-8 relative inline-block"
                id="payment-modal-title"
              >
                Оплата абонемента
                <span className="block h-1.5 w-24 bg-accent mt-2 rounded-full" aria-hidden="true"></span>
              </Dialog.Title>
              <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="payment-modal-title">
                <div className="form-group relative overflow-hidden">
                  <label htmlFor="email" className="sr-only">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    className={`w-full bg-gray-50 border-0 border-b-2 rounded-t-lg px-4 py-3.5 text-gray-800 transition-all duration-300 focus:outline-none 
                      ${focusedField === 'email' ? 'border-accent shadow-sm' : 'border-gray-200'}`}
                    required
                    placeholder="E-mail"
                    aria-required="true"
                    ref={initialFocusRef}
                  />
                  <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                    ${focusedField === 'email' ? 'w-full' : ''}`} aria-hidden="true"></div>
                </div>
                <div className="form-group relative overflow-hidden">
                  <label htmlFor="phone" className="sr-only">Контактный телефон</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus('phone')}
                    onBlur={handleBlur}
                    className={`w-full bg-gray-50 border-0 border-b-2 rounded-t-lg px-4 py-3.5 text-gray-800 transition-all duration-300 focus:outline-none 
                      ${focusedField === 'phone' ? 'border-accent shadow-sm' : 'border-gray-200'}`}
                    required
                    placeholder="Контактный телефон"
                    aria-required="true"
                  />
                  <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                    ${focusedField === 'phone' ? 'w-full' : ''}`} aria-hidden="true"></div>
                </div>
                <div className="form-group mb-2">
                  <label 
                    className="flex items-center cursor-pointer group" 
                    htmlFor="payment-consent" 
                  >
                    <div className="relative flex items-center mr-3">
                      <input 
                        id="payment-consent"
                        className="absolute opacity-0 w-5 h-5 cursor-pointer" 
                        required
                        aria-required="true"
                        type="checkbox"
                        checked={consentChecked}
                        onChange={handleConsentChange}
                      />
                      <div 
                        className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-300 flex-shrink-0 
                        ${consentChecked ? 'bg-accent border-accent' : 'bg-white border-gray-300 group-hover:border-accent'}`}
                        aria-hidden="true"
                      >
                        {consentChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 pt-0.5 text-left">
                      Я даю согласие на обработку персональных данных в соответствии с <a href="/policy" className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a>
                    </span>
                  </label>
                </div>
                {submitError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm" role="alert" aria-live="assertive">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <p className="font-bold text-red-800">Произошла ошибка!</p>
                    </div>
                    <p className="text-red-700">{submitError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  className={`w-full py-4 rounded-lg transition-all duration-500 font-semibold text-lg relative overflow-hidden ${
                    isSubmitting
                      ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                      : !consentChecked
                      ? 'bg-white text-accent border-2 border-accent cursor-not-allowed'
                      : 'bg-accent text-white hover:bg-accent-dark active:opacity-70'
                  }`}
                  disabled={isSubmitting || !consentChecked}
                  aria-disabled={isSubmitting || !consentChecked}
                  aria-busy={isSubmitting}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isSubmitting ? 'Перенаправление...' : 'Купить абонемент'}
                  </span>
                </button>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PaymentModal; 