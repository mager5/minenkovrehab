import { motion } from 'framer-motion';
import Image from 'next/image';
import { homeContent } from '@/data/home-content';

export function HelpSection() {
  return (
    <section className="py-20 bg-primary/95 text-white overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <motion.h2 
              className="text-3xl font-bold mb-8 leading-tight" 
              style={{color: '#d1f3ea'}}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {homeContent.help.title}
              <motion.span 
                className="text-accent-light"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >{homeContent.help.subtitle}</motion.span>
            </motion.h2>
            
            <div className="space-y-6">
              {homeContent.help.items.map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start bg-primary-dark/50 p-4 rounded-lg" 
                  style={{backgroundColor: 'rgba(209, 243, 234, 0.2)'}}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "0 10px 25px rgba(209, 243, 234, 0.2)",
                    backgroundColor: "#DCF5ED"
                  }}
                >
                  <motion.div 
                    className="bg-accent/20 p-2 rounded-lg mr-4" 
                    style={{backgroundColor: 'rgba(209, 243, 234, 0.3)'}}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="#d1f3ea">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-medium mb-2" style={{color: '#d1f3ea'}}>{item.title}</h3>
                    <p className="text-gray-200" style={{color: '#d1f3ea'}}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.div 
              className="absolute -inset-1 rounded-lg bg-accent/20 blur"
              animate={{ 
                boxShadow: ["0 0 20px 5px rgba(209, 243, 234, 0.2)", "0 0 30px 5px rgba(209, 243, 234, 0.4)", "0 0 20px 5px rgba(209, 243, 234, 0.2)"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            ></motion.div>
            <motion.div
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 