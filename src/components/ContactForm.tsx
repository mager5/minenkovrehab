'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setFormData({ name: '', email: '', phone: '', message: '' });
      setConsentChecked(false);
    }, 1500);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-primary mb-8 relative inline-block">
        Напишите мне
        <span className="block h-1.5 w-24 bg-accent mt-2 rounded-full"></span>
      </h2>
      
      {submitSuccess ? (
        <div className="bg-green-50 border-l-4 border-accent p-6 rounded-lg shadow-md animate-fadeIn">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="font-bold text-lg text-primary">Сообщение отправлено!</p>
          </div>
          <p className="text-gray-700">Благодарю за обращение. Я свяжусь с вами в ближайшее время.</p>
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
              required
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
              placeholder="Телефон (опционально)"
            />
            <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
              ${focusedField === 'phone' ? 'w-full' : ''}`}></div>
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
              ${focusedField === 'message' ? 'border-accent shadow-sm' : 'border-gray-200'}`}
              required
              placeholder="Ваше сообщение"
            ></textarea>
            <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 
              ${focusedField === 'message' ? 'w-full' : ''}`}></div>
          </div>
          
          <div className="form-group mb-2">
            <label className="flex items-center cursor-pointer group" style={{ display: 'flex' }}>
              <div className="relative flex items-center mr-3">
                <input 
                  type="checkbox" 
                  id="consent"
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
              <p className="text-red-700">Не удалось отправить сообщение. Пожалуйста, попробуйте снова позже.</p>
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
                  Отправить сообщение
                  <svg className="ml-2 w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 