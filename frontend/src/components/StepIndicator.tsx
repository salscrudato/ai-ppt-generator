import type { AppState } from '../types';
import { motion } from 'framer-motion';
import { HiPencilSquare, HiEye, HiPencil, HiArrowDownTray, HiCheck } from 'react-icons/hi2';
import clsx from 'clsx';

interface StepIndicatorProps {
  currentStep: AppState['step'];
}

const steps = [
  { key: 'input', label: 'Input & Parameters', icon: HiPencilSquare, description: 'Describe your presentation' },
  { key: 'preview', label: 'Preview Draft', icon: HiEye, description: 'Review AI-generated content' },
  { key: 'edit', label: 'Edit & Customize', icon: HiPencil, description: 'Fine-tune your slide' },
  { key: 'generate', label: 'Generate', icon: HiArrowDownTray, description: 'Download PowerPoint' }
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Enhanced Progress Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-sm"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>

        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative flex flex-col items-center z-10"
            >
              {/* Enhanced Step Circle */}
              <motion.div
                className={clsx(
                  'w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300',
                  {
                    'bg-white border-slate-300 text-slate-400 shadow-md hover:border-slate-400': !isActive,
                    'bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-400 text-white shadow-xl scale-110': isCurrent,
                    'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-lg': isCompleted,
                  }
                )}
                whileHover={{
                  scale: isCurrent ? 1.15 : 1.05,
                  rotate: isCurrent ? 5 : 0
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: isCurrent
                    ? 'var(--shadow-glow-primary)'
                    : isCompleted
                    ? 'var(--shadow-glow-success)'
                    : 'var(--shadow-md)'
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  >
                    <HiCheck className="w-7 h-7" />
                  </motion.div>
                ) : (
                  <IconComponent className="w-7 h-7" />
                )}
              </motion.div>

              {/* Enhanced Step Label */}
              <div className="mt-4 text-center max-w-32">
                <motion.div
                  className={clsx(
                    'text-sm font-bold transition-colors duration-300 mb-1',
                    {
                      'text-slate-500': !isActive,
                      'text-indigo-600': isCurrent,
                      'text-emerald-600': isCompleted,
                    }
                  )}
                  animate={{ scale: isCurrent ? 1.05 : 1 }}
                >
                  {step.label}
                </motion.div>
                <div className={clsx(
                  'text-xs transition-colors duration-300 leading-relaxed',
                  {
                    'text-slate-400': !isActive,
                    'text-slate-600': isCurrent,
                    'text-slate-500': isCompleted,
                  }
                )}>
                  {step.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
