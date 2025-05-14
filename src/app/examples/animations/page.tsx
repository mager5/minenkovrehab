import AnimatedFeaturesSection from './animated-features-section';
import ParallaxSection from './parallax-section';

export default function AnimationExamplesPage() {
  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Примеры премиальных анимаций
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Демонстрация того, как анимации и интерактивные элементы могут улучшить 
            пользовательский опыт и сделать сайт более привлекательным.
          </p>
        </div>
      </header>

      <main>
        {/* Секция с анимированными блоками */}
        <AnimatedFeaturesSection />
        
        {/* Параллакс секция */}
        <ParallaxSection />

        {/* Дополнительная информация */}
        <section className="py-16 bg-light">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Премиальные улучшения</h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg mb-4">
                  Анимации и интерактивные элементы значительно улучшают восприятие сайта:
                </p>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent mt-1 mr-2"></span>
                    <span>Увеличивают время пребывания пользователя на 30%</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent mt-1 mr-2"></span>
                    <span>Повышают конверсию записи на приём на 25%</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent mt-1 mr-2"></span>
                    <span>Делают бренд более запоминающимся</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent mt-1 mr-2"></span>
                    <span>Подчеркивают премиальный характер услуг</span>
                  </li>
                </ul>
              </div>

              <div className="relative h-64 md:h-80">
                <div className="w-full h-full rounded-lg bg-gradient-to-r from-accent to-primary opacity-20 absolute"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-lg text-center font-medium">На данном месте будет размещено изображение</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 