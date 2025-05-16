import { motion } from 'framer-motion';
import Link from 'next/link';
import { homeContent } from '@/data/home-content';

export function CTASection() {
  return (
    <section className="py-20 bg-gray-50 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 
          className="text-3xl font-bold text-primary mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          {homeContent.cta.title}
        </motion.h2>
        <motion.p 
          className="text-lg text-dark mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {homeContent.cta.description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link 
            href="/contacts"
            className="btn bg-accent hover:bg-accent-dark text-white !text-white px-8 py-3 rounded-md font-medium transition-all"
          >
            {homeContent.cta.buttonText}
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 