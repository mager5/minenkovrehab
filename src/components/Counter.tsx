import { motion } from 'framer-motion';

interface CounterProps {
  value: number;
  label: string;
  plus?: boolean;
  delay?: number;
}

export function Counter({ 
  value, 
  label, 
  plus = false, 
  delay = 0 
}: CounterProps) {
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
      }}
    >
      <motion.div 
        className="text-4xl font-bold text-primary mb-2"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ 
          duration: 0.8, 
          delay: delay + 0.2,
          type: "spring",
          stiffness: 150
        }}
      >
        {value}{plus && '+'}
      </motion.div>
      <motion.p 
        className="text-accent font-semibold"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay: delay + 0.4 }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
} 