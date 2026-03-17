import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export default function Placeholder({ title }) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-[#F2F6FB]">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center text-center max-w-sm"
            >
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                    <Construction className="w-8 h-8 text-primary-500" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
                <p className="text-sm text-gray-500">
                    This section is currently under construction. Please check back later.
                </p>
            </motion.div>
        </div>
    );
}
