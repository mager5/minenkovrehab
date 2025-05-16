import { motion } from 'framer-motion';
import Image from 'next/image';
import { Counter } from './Counter';
import { homeContent } from '@/data/home-content';

export function AboutSection() {
  return (
    <section className="py-20 bg-gray-50 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="text-accent font-semibold text-base uppercase tracking-wider"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            ОБО МНЕ
          </motion.span>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {homeContent.about.title}
          </motion.h2>
          <motion.div 
            className="h-1 w-20 bg-accent mx-auto"
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: "5rem", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          ></motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div>
            <motion.div 
              className="relative rounded-lg overflow-hidden shadow-lg"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative group w-full max-w-md lg:max-w-none">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Image 
                  src="/images/hero/her-banner-mob-retina.png" 
                  alt="Физическая реабилитация"
                  width={600}
                  height={700}
                  className="rounded-lg shadow-xl relative z-10 w-full h-auto object-cover"
                />
              </div>
              <motion.div 
                className="absolute top-0 right-0 bg-accent text-white font-bold py-2 px-4 rounded-bl-lg"
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {homeContent.about.experience}
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div>
            <motion.p 
              className="text-dark text-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {homeContent.about.description}
            </motion.p>
            
            <motion.div 
              className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px rgba(0,0,0,0.07)"
              }}
            >
              <h3 className="flex items-center text-xl font-semibold text-primary mb-3">
                <motion.div 
                  className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center text-accent mr-3"
                  whileHover={{ scale: 1.1, backgroundColor: "rgb(209, 243, 234)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                {homeContent.about.priceTitle}
              </h3>
              <p className="text-dark">
                {homeContent.about.priceDescription}
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px rgba(0,0,0,0.07)"
              }}
            >
              <h3 className="flex items-center text-xl font-semibold text-primary mb-3">
                <motion.div 
                  className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center text-accent mr-3"
                  whileHover={{ scale: 1.1, backgroundColor: "rgb(209, 243, 234)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </motion.div>
                {homeContent.about.methodsTitle}
              </h3>
              <p className="text-dark">
                {homeContent.about.methodsDescription}
              </p>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Статистика */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Counter value={homeContent.stats.satisfiedClients} label={homeContent.stats.satisfiedClientsLabel} plus={true} delay={0} />
          <Counter value={homeContent.stats.consultations} label={homeContent.stats.consultationsLabel} plus={true} delay={0.1} />
          <Counter value={homeContent.stats.onlinePrograms} label={homeContent.stats.onlineProgramsLabel} plus={true} delay={0.2} />
          <Counter value={homeContent.stats.experience} label={homeContent.stats.experienceLabel} plus={true} delay={0.3} />
        </div>
      </div>
    </section>
  );
} 