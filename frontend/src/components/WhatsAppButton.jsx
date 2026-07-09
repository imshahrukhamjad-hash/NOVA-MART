import React from 'react';
import { FiMessageCircle } from 'react-icons/fi';

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    // Open WhatsApp with the specified number
    const phoneNumber = "03056616939";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-neutral-400 hover:bg-neutral-900 hover:text-white"
      title="Chat on WhatsApp"
    >
      <span className="text-lg">
        <FiMessageCircle />
      </span>
      <span className="font-medium text-sm">WhatsApp Support</span>
    </button>
  );
};

export default WhatsAppButton;