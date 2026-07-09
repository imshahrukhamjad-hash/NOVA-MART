import React from 'react';
import { FiMail } from 'react-icons/fi';

const MailboxButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-neutral-400 hover:bg-neutral-900 hover:text-white"
      title="View User Emails"
    >
      <span className="text-lg">
        <FiMail />
      </span>
      <span className="font-medium text-sm">Mailbox</span>
    </button>
  );
};

export default MailboxButton;