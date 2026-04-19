import { motion } from 'framer-motion';

const Card = ({
    children,
    hover = true,
    className = '',
    gradient = false,
    ...props
}) => {
    return (
        <motion.div
            whileHover={hover ? { y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
            className={`
        bg-white rounded-2xl p-6 
        shadow-lg border border-gray-100
        transition-all duration-300
        ${gradient ? 'bg-gradient-to-br from-white to-blue-50' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;