import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiX, FiMail, FiUser, FiClock, FiSearch, FiRefreshCw, FiTrash2, FiMessageSquare } from 'react-icons/fi';

const MailboxModal = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/help/emails');
      setEmails(response.data);
      setSelectedEmail(response.data && response.data.length ? response.data[0] : null);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/help/emails');
      setEmails(response.data);
      setSelectedEmail(response.data && response.data.length ? response.data[0] : null);
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await axios.delete(`/help/emails/${id}`);
      const filtered = emails.filter(e => e._id !== id);
      setEmails(filtered);
      setSelectedEmail(filtered.length ? filtered[0] : null);
    } catch (e) {
      console.error('Delete failed', e);
      alert('Failed to delete');
    }
  };

  const filteredEmails = emails.filter(e => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (e.subject || '').toLowerCase().includes(s) || (e.message || '').toLowerCase().includes(s) || (e.userId?.name || '').toLowerCase().includes(s);
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 rounded-2xl w-full max-w-6xl max-h-[80vh] border border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 p-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <FiMail className="text-white" />
              <h2 className="text-lg font-bold text-white">User Support</h2>
              <span className="text-sm text-neutral-400">• {emails.length} messages</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-neutral-800 rounded-md px-2 py-1 border border-neutral-700">
                <FiSearch className="text-neutral-400 mr-2" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search messages"
                  className="bg-transparent outline-none text-sm text-neutral-200 placeholder:text-neutral-500 w-44"
                />
              </div>
              <button onClick={handleRefresh} className="p-2 rounded-md hover:bg-neutral-800 text-neutral-300" title="Refresh">
                <FiRefreshCw />
              </button>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-neutral-800 text-neutral-300" title="Close">
                <FiX />
              </button>
            </div>
          </div>

          {/* Body: two columns */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: list */}
            <div className="w-80 border-r border-neutral-800 overflow-y-auto p-3 bg-neutral-900 scrollbar-custom">
              {loading ? (
                <div className="text-center py-12 text-neutral-400">Loading emails...</div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <FiMail size={36} className="mx-auto mb-3 text-neutral-500" />
                  No messages
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEmails.map((email) => (
                    <div
                      key={email._id}
                      onClick={() => setSelectedEmail(email)}
                      className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors ${selectedEmail?._id === email._id ? 'bg-neutral-800 border border-neutral-700' : 'hover:bg-neutral-800'}`}
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center">
                        <FiUser className="text-neutral-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">{email.subject}</h4>
                          <span className="text-xs text-neutral-500">{new Date(email.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-neutral-400 truncate">{email.userId?.name} — {email.userId?.email}</p>
                        <p className="mt-1 text-xs text-neutral-400 truncate">{(email.message || '').slice(0, 80)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: detail */}
            <div className="flex-1 p-6 overflow-y-auto scrollbar-custom">
              {!selectedEmail ? (
                <div className="h-full flex items-center justify-center text-neutral-400">Select a message to view details</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedEmail.subject}</h3>
                      <div className="text-sm text-neutral-400 mt-1">From: <span className="text-neutral-200 font-medium">{selectedEmail.userId?.name}</span> • {selectedEmail.userId?.email}</div>
                      <div className="text-xs text-neutral-500">{new Date(selectedEmail.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => alert('Reply action (not implemented)')} className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-md shadow-sm hover:brightness-105">
                        <FiMessageSquare /> Reply
                      </button>
                      <button onClick={() => handleDelete(selectedEmail._id)} className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-800 text-neutral-200 rounded-md hover:bg-red-700 hover:text-white">
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-neutral-200 text-sm leading-relaxed">{selectedEmail.message}</pre>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MailboxModal;