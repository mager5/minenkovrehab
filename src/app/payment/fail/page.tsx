export default function PaymentFail() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Оплата не прошла</h1>
      <p className="text-lg text-gray-700 mb-8">К сожалению, оплата не была завершена. Попробуйте ещё раз или свяжитесь с поддержкой.</p>
      <a href="/" className="text-accent hover:underline font-medium">Вернуться на главную</a>
    </div>
  );
} 