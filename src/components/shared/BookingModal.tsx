'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoMdClose } from 'react-icons/io';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  
  // Сброс формы при открытии/закрытии модального окна
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        service: '',
        message: '',
      });
      setSubmitSuccess(false);
      setSubmitError(false);
      setConsentChecked(false);
      // Добавляем случайный параметр к URL при открытии модального окна
      const timestamp = new Date().getTime();
      window.history.replaceState({}, '', `${window.location.pathname}?modal=${timestamp}`);
    }
  }, [isOpen]);

  // Ref для фокуса на первом элементе при открытии
  const initialFocusRef = useRef(null);
  
  const services = [
    { id: 'online-consultation', name: 'Онлайн-консультация' },
    { id: 'online-support', name: 'Онлайн-ведение' },
    { id: 'movement-club', name: 'Клуб «ФОРМУЛА ДВИЖЕНИЯ»' },
    { id: 'rehab-protocol', name: 'Реабилитационный протокол' },
    { id: 'course', name: 'Курс или вебинар' },
  ];
  
  const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 1) return '+7';
    
    let formattedNumber = '+7';
    if (phoneNumberLength === 1 && phoneNumber !== '7') {
      formattedNumber = `+7 (${phoneNumber}`;
    } else if (phoneNumberLength > 1) {
      formattedNumber = `+7 (${phoneNumber.substring(1, 4)}`;
    }

    if (phoneNumberLength > 4) {
      formattedNumber += `) ${phoneNumber.substring(4, 7)}`;
    }
    if (phoneNumberLength > 7) {
      formattedNumber += `-${phoneNumber.substring(7, 9)}`;
    }
    if (phoneNumberLength > 9) {
      formattedNumber += `-${phoneNumber.substring(9, 11)}`;
    }
    return formattedNumber;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      // Ограничиваем максимальную длину отформатированного номера, чтобы соответствовать +7 (XXX) XXX-XX-XX
      if (formattedValue.length > 18) return;
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleFocus = (field: string) => {
    setFocusedField(field);
  };
  
  const handleBlur = () => {
    setFocusedField(null);
  };
  
  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsentChecked(e.target.checked);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentChecked) {
      return; // Prevent submission if consent is not checked
    }
    
    setIsSubmitting(true);
    setSubmitError(false);
    
    // Имитация отправки данных формы
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Сброс формы после успешной отправки
      setFormData({
        name: '',
        phone: '',
        service: '',
        message: '',
      });
      setConsentChecked(false);
    }, 1500);
  };

  // Обработчик нажатия клавиши Escape для закрытия модального окна
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        initialFocus={initialFocusRef}
        onKeyDown={handleKeyDown}
      >
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

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                  id="booking-modal-title"
                >
                  Записаться на приём
                  <span className="block h-1.5 w-24 bg-accent mt-2 rounded-full" aria-hidden="true"></span>
                </Dialog.Title>

                {submitSuccess ? (
                  <div className="bg-green-50 border-l-4 border-accent p-6 rounded-lg shadow-md animate-fadeIn" role="status" aria-live="polite">
                    <div className="flex items-center mb-3">
                      <svg className="w-6 h-6 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <p className="font-bold text-lg text-primary">Запись оформлена!</p>
                    </div>
                    <p className="text-gray-700">Благодарю за обращение. Я свяжусь с вами в ближайшее время для подтверждения записи.</p>
                    <div className="mt-5">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-accent bg-white border border-accent rounded-md hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                        onClick={onClose}
                        ref={initialFocusRef}
                      >
                        Закрыть
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="booking-modal-title">
                    <div className="form-group relative overflow-hidden">
                      <label htmlFor="name" className="sr-only">Ваше имя</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => handleFocus('name')}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-50 border-0 border-b-2 rounded-t-lg px-4 py-3.5 text-gray-800 transition-all duration-300 focus:outline-none 
                        ${focusedField === 'name' ? 'border-accent shadow-sm' : 'border-gray-200'}`}
                        required
                        placeholder="Ваше имя"
                        aria-required="true"
                        ref={initialFocusRef}
                      />
                      <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                        ${focusedField === 'name' ? 'w-full' : ''}`} aria-hidden="true"></div>
                    </div>
                    
                    <div className="form-group relative overflow-hidden">
                      <label htmlFor="phone" className="sr-only">Телефон</label>
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
                        placeholder="Телефон"
                        pattern="\+7 \([0-9]{3}\) [0-9]{3}-[0-9]{2}-[0-9]{2}"
                        aria-required="true"
                        aria-describedby="phone-format"
                      />
                      <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                        ${focusedField === 'phone' ? 'w-full' : ''}`} aria-hidden="true"></div>
                      <div id="phone-format" className="sr-only">Формат телефона: +7 (999) 999-99-99</div>
                    </div>
                    
                    <div className="form-group relative overflow-hidden">
                      <label htmlFor="service" className="sr-only">Выберите услугу</label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        onFocus={() => handleFocus('service')}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-50 border-0 border-b-2 rounded-t-lg px-4 py-3.5 text-gray-800 transition-all duration-300 focus:outline-none appearance-none
                        ${focusedField === 'service' ? 'border-accent shadow-sm' : 'border-gray-200'} 
                        [&>option]:bg-white [&>option]:py-2 [&>option]:px-4 [&>option]:text-gray-800 
                        [&>option:hover]:bg-accent [&>option:hover]:text-white [&>option:checked]:bg-accent/20`}
                        required
                        aria-required="true"
                        style={{
                          backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpath d=\'m6 9 6 6 6-6\'/%3e%3c/svg%3e")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1.25rem',
                          paddingRight: '2.5rem'
                        }}
                      >
                        <option value="" disabled>Выберите услугу</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                      <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                        ${focusedField === 'service' ? 'w-full' : ''}`} aria-hidden="true"></div>
                    </div>
                    
                    <div className="form-group relative overflow-hidden">
                      <label htmlFor="message" className="sr-only">Ваше сообщение</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => handleFocus('message')}
                        onBlur={handleBlur}
                        rows={4}
                        className={`w-full bg-gray-50 border-0 border-b-2 rounded-t-lg px-4 py-3.5 text-gray-800 transition-all duration-300 focus:outline-none resize-none 
                        ${focusedField === 'message' ? 'border-accent shadow-sm' : 'border-gray-200'}
                        font-medium placeholder:text-gray-500 placeholder:font-normal tracking-wide`}
                        placeholder="Ваше сообщение"
                        aria-required="false"
                      ></textarea>
                      <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                        ${focusedField === 'message' ? 'w-full' : ''}`} aria-hidden="true"></div>
                    </div>
                    
                    <div className="form-group mb-2">
                      <label 
                        className="flex items-center cursor-pointer group" 
                        htmlFor="modal-consent" 
                      >
                        <div className="relative flex items-center mr-3">
                          <input 
                            id="modal-consent"
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
                        <p className="text-red-700">Не удалось отправить заявку. Пожалуйста, попробуйте снова позже.</p>
                      </div>
                    )}
                    
                    <div className="mt-8">
                      <button 
                        type="submit" 
                        className={`w-full py-4 rounded-lg transition-all duration-500 font-semibold text-lg relative overflow-hidden ${
                          isSubmitting 
                            ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                            : !consentChecked
                            ? 'bg-white text-accent border-2 border-accent cursor-not-allowed'
                            : 'bg-accent text-white hover:bg-accent-dark'
                        }`}
                        disabled={isSubmitting || !consentChecked}
                        aria-disabled={isSubmitting || !consentChecked}
                        aria-busy={isSubmitting}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {isSubmitting ? 'Отправка...' : 'Записаться'}
                          {!isSubmitting && (
                            <svg className="ml-2 w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          )}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BookingModal; 