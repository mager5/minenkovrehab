import { motion } from 'framer-motion';
import Link from 'next/link';

interface TeamSectionProps {
  title: string;
  description: string;
}

export function TeamSection({ title, description }: TeamSectionProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-primary mb-6">{title}</h2>
          <p className="text-lg text-gray-600 mb-12">{description}</p>
        </motion.div>

        <div className="mt-8 text-center">
          <motion.div
            className="inline-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link 
              href="/contacts"
              className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-md font-medium transition-all inline-block"
            >
              Связаться со мной
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 