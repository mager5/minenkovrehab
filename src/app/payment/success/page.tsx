export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Оплата прошла успешно!</h1>
      <p className="text-lg text-gray-700 mb-8">Спасибо за оплату абонемента. Доступ будет предоставлен в ближайшее время.</p>
      <a href="/" className="text-accent hover:underline font-medium">Вернуться на главную</a>
    </div>
  );
} 