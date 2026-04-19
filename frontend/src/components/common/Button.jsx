import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-105 active:scale-95',
        secondary: 'bg-white text-gray-800 border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
        danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-xl hover:scale-105',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="animate-spin" size={20} />
            ) : Icon ? (
                <Icon size={20} />
            ) : null}
            {children}
        </motion.button>
    );
};

export default Button;