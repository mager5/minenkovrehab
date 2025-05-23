import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Договор-оферта | Миненков Вадим',
  description: 'Договор-оферта на оказание услуг физическим реабилитологом Миненковым Вадимом',
};

export default function TermsPage() {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8">
            Договор-оферта
          </h1>
          
          <div className="prose prose-lg max-w-none text-dark">
            <p className="mb-4">
              Настоящий документ является публичной офертой ИП Миненков Вадим (далее – «Исполнитель») 
              и содержит все существенные условия договора на оказание услуг физической реабилитации.
            </p>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">1. Общие положения</h2>
            <p className="mb-4">
              1.1. В соответствии с пунктом 2 статьи 437 Гражданского Кодекса Российской Федерации (ГК РФ), в случае 
              принятия изложенных ниже условий и оплаты услуг, физическое лицо, производящее акцепт этой оферты становится 
              Заказчиком (в соответствии с пунктом 3 статьи 438 ГК РФ акцепт оферты равносилен заключению договора на 
              условиях, изложенных в оферте).
            </p>
            <p className="mb-4">
              1.2. Акцептом условий, изложенных в настоящем Договоре оферты, является факт оплаты Услуг.
            </p>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">2. Предмет договора</h2>
            <p className="mb-4">
              2.1. Исполнитель обязуется оказать Заказчику услуги в области физической реабилитации в соответствии с 
              выбранной Заказчиком услугой из каталога, размещенного на сайте Исполнителя по адресу: minenkovrehab.ru, 
              а Заказчик обязуется принять и оплатить оказанные услуги.
            </p>
            <p className="mb-4">
              2.2. Виды услуг, их стоимость и иные существенные условия указаны на сайте Исполнителя в соответствующих 
              разделах.
            </p>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">3. Права и обязанности сторон</h2>
            <p className="mb-4">
              3.1. Исполнитель обязуется:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Оказывать услуги качественно и в соответствии с требованиями, указанными в описании услуги;</li>
              <li>Предоставить Заказчику доступ к приобретенным материалам после оплаты;</li>
              <li>Обеспечить конфиденциальность информации, предоставленной Заказчиком, за исключением случаев, когда 
              предоставление доступа к такой информации предусмотрено требованиями законодательства РФ.</li>
            </ul>
            
            <p className="mb-4">
              3.2. Заказчик обязуется:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Своевременно и в полном объеме оплачивать услуги Исполнителя;</li>
              <li>Предоставлять достоверную информацию о состоянии своего здоровья, необходимую для оказания услуг;</li>
              <li>Выполнять рекомендации Исполнителя;</li>
              <li>Не передавать третьим лицам полученные от Исполнителя материалы, методики и протоколы;</li>
              <li>Соблюдать авторские права Исполнителя на все материалы, полученные в рамках оказания услуг.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">4. Стоимость услуг и порядок расчетов</h2>
            <p className="mb-4">
              4.1. Стоимость услуг Исполнителя определяется в соответствии с выбранной Заказчиком услугой и указана на 
              сайте minenkovrehab.ru.
            </p>
            <p className="mb-4">
              4.2. Оплата услуг осуществляется Заказчиком в порядке 100% предоплаты путем перечисления денежных средств на 
              расчетный счет Исполнителя с использованием одного из платежных методов, доступных на сайте Исполнителя.
            </p>
            <p className="mb-4">
              4.3. Обязательство Заказчика по оплате считается исполненным с момента зачисления денежных средств на 
              расчетный счет Исполнителя.
            </p>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">5. Ответственность сторон</h2>
            <p className="mb-4">
              5.1. Исполнитель не несет ответственности за невозможность оказания услуг Заказчику по причинам, не зависящим 
              от Исполнителя, включая нарушение работы линий связи, неисправность оборудования и т.п.
            </p>
            <p className="mb-4">
              5.2. Исполнитель не несет ответственности за несоответствие оказанных услуг ожиданиям Заказчика. Никакие 
              денежные средства не подлежат возврату в случае отсутствия у Заказчика желаемого результата.
            </p>
            <p className="mb-4">
              5.3. Исполнитель не несет ответственности за вред, причиненный здоровью Заказчика в случае ненадлежащего 
              исполнения Заказчиком обязательств по настоящему договору, нарушения требований специалистов Исполнителя, 
              сокрытия Заказчиком информации о состоянии своего здоровья.
            </p>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">6. Срок действия и изменение договора оферты</h2>
            <p className="mb-4">
              6.1. Договор вступает в силу с момента акцепта оферты Заказчиком и действует до момента исполнения сторонами 
              обязательств по договору.
            </p>
            <p className="mb-4">
              6.2. Исполнитель оставляет за собой право внести изменения в условия Оферты или отозвать Оферту в любой момент 
              по своему усмотрению.
            </p>
            
            <h2 className="text-xl font-semibold text-primary mt-8 mb-4">7. Заключительные положения</h2>
            <p className="mb-4">
              7.1. Во всем, что не урегулировано настоящим договором, стороны руководствуются действующим законодательством 
              Российской Федерации.
            </p>
            <p className="mb-4">
              7.2. Все споры и разногласия между сторонами разрешаются путем переговоров. В случае невозможности 
              урегулирования спора путем переговоров, он разрешается в судебном порядке в соответствии с 
              законодательством РФ.
            </p>
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