'use client';

import { Fragment, useState, useEffect } from 'react';
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
    email: '',
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
        email: '',
        service: '',
        message: '',
      });
      setSubmitSuccess(false);
      setSubmitError(false);
      setConsentChecked(false);
    }
  }, [isOpen]);
  
  const services = [
    { id: 'online-consultation', name: 'Онлайн-консультация' },
    { id: 'online-support', name: 'Онлайн-ведение' },
    { id: 'movement-club', name: 'Клуб «ФОРМУЛА ДВИЖЕНИЯ»' },
    { id: 'rehab-protocol', name: 'Реабилитационный протокол' },
    { id: 'course', name: 'Курс или вебинар' },
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsentChecked(e.target.checked);
  };
  
  const handleFocus = (field: string) => {
    setFocusedField(field);
  };
  
  const handleBlur = () => {
    setFocusedField(null);
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
    }, 1500);
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                
                <h2 className="text-2xl font-bold text-primary mb-8 relative inline-block">
                  Записаться на приём
                  <span className="block h-1.5 w-24 bg-accent mt-2 rounded-full"></span>
                </h2>

                {submitSuccess ? (
                  <div className="bg-green-50 border-l-4 border-accent p-6 rounded-lg shadow-md animate-fadeIn">
                    <div className="flex items-center mb-3">
                      <svg className="w-6 h-6 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      >
                        Закрыть
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group relative overflow-hidden">
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
                        />
                        <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                          ${focusedField === 'name' ? 'w-full' : ''}`}></div>
                      </div>
                      
                      <div className="form-group relative overflow-hidden">
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
                          placeholder="Email"
                        />
                        <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                          ${focusedField === 'email' ? 'w-full' : ''}`}></div>
                      </div>
                    </div>
                    
                    <div className="form-group relative overflow-hidden">
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
                      />
                      <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                        ${focusedField === 'phone' ? 'w-full' : ''}`}></div>
                    </div>
                    
                    <div className="form-group relative overflow-hidden">
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
                        ${focusedField === 'service' ? 'w-full' : ''}`}></div>
                    </div>
                    
                    <div className="form-group relative overflow-hidden">
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
                        font-medium placeholder:text-gray-500 placeholder:font-normal tracking-wide
                        focus:ring-1 focus:ring-accent/20 focus:shadow-inner focus:bg-gray-50/80`}
                        placeholder="Ваше сообщение"
                        style={{
                          lineHeight: '1.6',
                          minHeight: '120px',
                          backgroundImage: 'linear-gradient(to bottom, rgba(247, 248, 249, 0.05), rgba(243, 244, 246, 0.2))'
                        }}
                      ></textarea>
                      <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
                        ${focusedField === 'message' ? 'w-full' : ''}`}></div>
                      <div className="absolute top-3 right-3 opacity-30 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="form-group mb-2">
                      <label className="flex items-center cursor-pointer group" style={{ display: 'flex' }}>
                        <div className="relative flex items-center mr-3">
                          <input 
                            type="checkbox" 
                            id="consent-modal"
                            className="absolute opacity-0 w-5 h-5 cursor-pointer" 
                            checked={consentChecked}
                            onChange={handleConsentChange}
                            required
                          />
                          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-300 flex-shrink-0
                            ${consentChecked ? 'bg-accent border-accent' : 'border-gray-300 group-hover:border-accent'}`}>
                            {consentChecked && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700 pt-0.5 text-left">
                          Я даю согласие на обработку персональных данных в соответствии с <a href="/policy" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a>
                        </span>
                      </label>
                    </div>
                    
                    {submitError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          </svg>
                          <p className="font-bold text-red-800">Произошла ошибка!</p>
                        </div>
                        <p className="text-red-700">Не удалось создать запись. Пожалуйста, попробуйте снова позже.</p>
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
                            : 'bg-accent text-white hover:bg-accent-dark shadow-md hover:shadow-xl transform hover:-translate-y-1'
                        }`}
                        disabled={isSubmitting || !consentChecked}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Отправка...
                          </span>
                        ) : (
                          <span className="relative z-10 flex items-center justify-center">
                            Записаться
                            <svg className="ml-2 w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
                
                {!submitSuccess && (
                  <p className="text-sm text-gray-600 mt-6 font-medium flex items-center" style={{ display: 'none' }}>
                    <svg className="w-4 h-4 mr-2 text-accent mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Ваши данные не будут переданы третьим лицам и используются только для связи с вами.
                  </p>
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