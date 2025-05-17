'use client';

import { useState } from 'react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setFormData({ name: '', phone: '', message: '' });
      setConsentChecked(false);
    }, 1500);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-primary mb-8 relative inline-block" id="contact-form-heading">
        Напишите мне
        <span className="block h-1.5 w-24 bg-accent mt-2 rounded-full" aria-hidden="true"></span>
      </h2>
      
      {submitSuccess ? (
        <div className="bg-green-50 border-l-4 border-accent p-6 rounded-lg shadow-md animate-fadeIn" role="status" aria-live="polite">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="font-bold text-lg text-primary">Сообщение отправлено!</p>
          </div>
          <p className="text-gray-700">Благодарю за обращение. Я свяжусь с вами в ближайшее время.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="contact-form-heading">
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
              placeholder="Телефон (опционально)"
              aria-required="false"
            />
            <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
              ${focusedField === 'phone' ? 'w-full' : ''}`} aria-hidden="true"></div>
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
              ${focusedField === 'message' ? 'border-accent shadow-sm' : 'border-gray-200'}`}
              required
              placeholder="Ваше сообщение"
              aria-required="true"
            ></textarea>
            <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
              ${focusedField === 'message' ? 'w-full' : ''}`} aria-hidden="true"></div>
          </div>
          
          <div className="form-group mb-2">
            <label 
              className="flex items-center cursor-pointer group" 
              htmlFor="consent" 
            >
              <div className="relative flex items-center mr-3">
                <input 
                  id="consent"
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
          
          <button
            type="submit"
            className={`w-full py-4 rounded-lg transition-all duration-500 font-semibold text-lg relative overflow-hidden ${
              isSubmitting 
                ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                : !consentChecked
                ? 'bg-white text-accent border-2 border-accent cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-dark shadow-md hover:shadow-xl transform hover:-translate-y-1'
            } focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`}
            disabled={isSubmitting || !consentChecked}
            aria-disabled={isSubmitting || !consentChecked}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Отправка...
              </span>
            ) : (
              <span className="relative z-10 flex items-center justify-center">
                Отправить сообщение
                <svg className="ml-2 w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
            )}
          </button>

          {submitError && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg" role="alert" aria-live="assertive">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Что-то пошло не так. Пожалуйста, попробуйте позже или свяжитесь со мной другим способом.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
} 