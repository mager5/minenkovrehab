import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { homeContent } from '@/data/home-content';

export function ServicesSection() {
  return (
    <section className="py-20 bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.span 
            className="text-accent font-semibold text-base uppercase tracking-wider"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >УСЛУГИ</motion.span>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {homeContent.services.title}
          </motion.h2>
          <motion.div 
            className="h-1 w-20 bg-accent mx-auto"
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: "5rem", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Услуга 1 */}
          <ServiceCard 
            title={homeContent.services.consultations.title}
            description={homeContent.services.consultations.description}
            image="https://images.unsplash.com/photo-1598257006458-087169a1f08d?q=80&w=600&h=400&auto=format&fit=crop"
            delay={0.1}
          />
          
          {/* Услуга 2 */}
          <ServiceCard 
            title={homeContent.services.programs.title}
            description={homeContent.services.programs.description}
            image="/images/services/individual-programs.svg"
            delay={0.2}
          />
          
          {/* Услуга 3 */}
          <ServiceCard 
            title={homeContent.services.analysis.title}
            description={homeContent.services.analysis.description}
            image="/images/services/movement-analysis.svg"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  delay: number;
}

function ServiceCard({ title, description, image, delay }: ServiceCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring", 
        stiffness: 50 
      }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
    >
      <div className="relative h-52">
        <Image 
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <motion.span 
            className="font-semibold text-accent-light"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: delay + 0.1 }}
          >{title}</motion.span>
        </div>
      </div>
      <div className="p-6">
        <motion.h3 
          className="text-xl font-semibold text-primary mb-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
        >{title}</motion.h3>
        <motion.p 
          className="text-dark mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: delay + 0.3 }}
        >
          {description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: delay + 0.4 }}
          whileHover={{ x: 5 }}
        >
          <Link 
            href="/products" 
            className="inline-block text-accent hover:text-accent-dark transition-colors font-medium"
          >
            Подробнее
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
} 