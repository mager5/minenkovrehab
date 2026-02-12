'use client';

import { MockAuthProvider } from '@/hooks/useMockAuth';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MockAuthProvider>
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <AnimatePresence mode='wait'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className='w-full max-w-md space-y-8'
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </MockAuthProvider>
  );
}
