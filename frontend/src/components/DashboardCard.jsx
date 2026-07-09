import { motion } from "framer-motion";

export default function DashboardCard({ title, value, icon, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center justify-between p-6 rounded-2xl shadow-lg bg-gradient-to-r ${color} text-white cursor-pointer`}
    >
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </div>
      <div className="text-4xl opacity-80">{icon}</div>
    </motion.div>
  );
}
