import { motion } from 'framer-motion';
import { useState } from 'react';

const Input = ({
    label,
    icon: Icon,
    error,
    className = '',
    autoComplete,  // ✅ Extract autoComplete separately
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value && props.value.length > 0;

    return (
        <div className="relative">
            <div className="relative">
                {/* Icon */}
                {Icon && (
                    <Icon
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 z-10 ${isFocused ? 'text-blue-500' : 'text-gray-400'
                            }`}
                        size={20}
                    />
                )}

                {/* Input Field */}
                <input
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoComplete={autoComplete}  // ✅ Pass autoComplete explicitly
                    className={`
                        w-full px-4 py-3.5 ${Icon ? 'pl-12' : ''} 
                        border-2 ${error ? 'border-red-400' : isFocused ? 'border-blue-500' : 'border-gray-200'} 
                        rounded-xl outline-none bg-white
                        ${isFocused ? 'ring-4 ring-blue-100' : ''}
                        transition-all duration-300
                        placeholder-transparent
                        ${className}
                    `}
                    placeholder={label}
                    {...props}
                />

                {/* Floating Label */}
                <motion.label
                    initial={false}
                    animate={{
                        top: isFocused || hasValue ? '-10px' : '50%',
                        translateY: isFocused || hasValue ? '0%' : '-50%',
                        fontSize: isFocused || hasValue ? '0.75rem' : '1rem',
                        color: isFocused ? '#3b82f6' : error ? '#ef4444' : '#64748b',
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-4 px-2 bg-white pointer-events-none font-medium z-20"
                >
                    {label}
                </motion.label>
            </div>

            {/* Error Message */}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-sm text-red-500 ml-1 flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Input;