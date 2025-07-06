import { sanitizeInput } from './security';

/**
 * Схемы валидации для форм
 */
export interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
  message?: string;
}

/**
 * Валидация телефонного номера
 */
export const validatePhone = (
  phone: string
): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(phone);
  const phoneRegex = /^[+]?[1-9]\d{1,14}$/; // Международный формат E.164

  if (!sanitized) {
    return { isValid: false, error: 'Телефон обязателен' };
  }

  if (!phoneRegex.test(sanitized.replace(/[\s()-]/g, ''))) {
    return { isValid: false, error: 'Неверный формат телефона' };
  }

  return { isValid: true };
};

/**
 * Валидация email
 */
export const validateEmail = (
  email: string
): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: true }; // Email необязателен
  }

  const sanitized = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Неверный формат email' };
  }

  return { isValid: true };
};

/**
 * Валидация имени
 */
export const validateName = (
  name: string
): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(name);

  if (!sanitized) {
    return { isValid: false, error: 'Имя обязательно' };
  }

  if (sanitized.length < 2) {
    return { isValid: false, error: 'Имя должно содержать минимум 2 символа' };
  }

  if (sanitized.length > 50) {
    return { isValid: false, error: 'Имя не должно превышать 50 символов' };
  }

  const nameRegex = /^[а-яёА-ЯЁa-zA-Z\s-]+$/;
  if (!nameRegex.test(sanitized)) {
    return {
      isValid: false,
      error: 'Имя может содержать только буквы, пробелы и дефисы',
    };
  }

  return { isValid: true };
};

/**
 * Валидация сообщения
 */
export const validateMessage = (
  message: string
): { isValid: boolean; error?: string } => {
  if (!message) {
    return { isValid: true }; // Сообщение необязательно
  }

  const sanitized = sanitizeInput(message);

  if (sanitized.length > 1000) {
    return {
      isValid: false,
      error: 'Сообщение не должно превышать 1000 символов',
    };
  }

  return { isValid: true };
};

/**
 * Валидация даты
 */
export const validateDate = (
  date: string
): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(date);

  if (!sanitized) {
    return { isValid: false, error: 'Дата обязательна' };
  }

  const selectedDate = new Date(sanitized);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, error: 'Неверный формат даты' };
  }

  if (selectedDate < today) {
    return { isValid: false, error: 'Дата не может быть в прошлом' };
  }

  // Проверка на разумный диапазон (не более года вперед)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (selectedDate > maxDate) {
    return { isValid: false, error: 'Дата не может быть более чем через год' };
  }

  return { isValid: true };
};

/**
 * Валидация времени
 */
export const validateTime = (
  time: string
): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(time);

  if (!sanitized) {
    return { isValid: false, error: 'Время обязательно' };
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(sanitized)) {
    return { isValid: false, error: 'Неверный формат времени (HH:MM)' };
  }

  const timeParts = sanitized.split(':');
  if (timeParts.length !== 2) {
    return { isValid: false, error: 'Неверный формат времени' };
  }

  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);

  // Проверяем, что часы и минуты корректно распарсились
  if (isNaN(hours) || isNaN(minutes)) {
    return { isValid: false, error: 'Неверный формат времени' };
  }

  // Рабочие часы: 9:00 - 18:00
  if (hours < 9 || hours > 18 || (hours === 18 && minutes > 0)) {
    return {
      isValid: false,
      error: 'Время должно быть в рабочих часах (9:00 - 18:00)',
    };
  }

  return { isValid: true };
};

/**
 * Валидация услуги
 */
export const validateService = (
  service: string
): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(service);

  if (!sanitized) {
    return { isValid: false, error: 'Услуга обязательна' };
  }

  // Список допустимых услуг (должен соответствовать данным в content.ts)
  const validServices = [
    'Консультация врача',
    'Физиотерапия',
    'Массаж',
    'ЛФК',
    'Психологическая поддержка',
    'Логопедия',
  ];

  if (!validServices.includes(sanitized)) {
    return { isValid: false, error: 'Выберите услугу из списка' };
  }

  return { isValid: true };
};

/**
 * Полная валидация формы контактов
 */
export const validateContactForm = (
  data: ContactFormData
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error!;
  }

  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error!;
  }

  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!;
    }
  }

  if (data.message) {
    const messageValidation = validateMessage(data.message);
    if (!messageValidation.isValid) {
      errors.message = messageValidation.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Полная валидация формы бронирования
 */
export const validateBookingForm = (
  data: BookingFormData
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error!;
  }

  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error!;
  }

  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!;
    }
  }

  const serviceValidation = validateService(data.service);
  if (!serviceValidation.isValid) {
    errors.service = serviceValidation.error!;
  }

  const dateValidation = validateDate(data.date);
  if (!dateValidation.isValid) {
    errors.date = dateValidation.error!;
  }

  const timeValidation = validateTime(data.time);
  if (!timeValidation.isValid) {
    errors.time = timeValidation.error!;
  }

  if (data.message) {
    const messageValidation = validateMessage(data.message);
    if (!messageValidation.isValid) {
      errors.message = messageValidation.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
