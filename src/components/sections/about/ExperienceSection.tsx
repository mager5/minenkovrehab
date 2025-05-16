import { motion } from 'framer-motion';
import { Counter } from '@/components/ui/Counter';

interface ExperienceSectionProps {
  title: string;
  description: string;
  stats: {
    value: number;
    label: string;
  }[];
}

export function ExperienceSection({ title, description, stats }: ExperienceSectionProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-primary mb-6">{title}</h2>
          <p className="text-lg text-gray-600">{description}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Counter 
              key={index}
              value={stat.value}
              label={stat.label}
              plus={true}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 