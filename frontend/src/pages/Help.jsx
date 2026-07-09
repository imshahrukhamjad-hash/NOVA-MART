import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiClock,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiPackage,
  FiCreditCard,
  FiUser,
  FiTrendingUp,
} from 'react-icons/fi';

export default function Help() {
  const { theme } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Orders & Shipping',
      items: [
        {
          q: 'How do I track my order?',
          a: 'Once your order is confirmed, you will receive a tracking number via email. You can use this number to track your shipment in real-time through our tracking portal or directly on the carrier\'s website.',
        },
        {
          q: 'What is the estimated delivery time?',
          a: 'Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business day delivery. Delivery times may vary based on your location and current order volume.',
        },
        {
          q: 'Can I change my delivery address?',
          a: 'You can modify your delivery address within 2 hours of placing your order. After that, please contact our support team immediately as changes may not be possible if the order has already shipped.',
        },
        {
          q: 'Do you ship internationally?',
          a: 'Yes, we ship to over 100 countries worldwide. International shipping costs and delivery times vary by destination. You can check shipping availability during checkout.',
        },
      ],
    },
    {
      category: 'Payments & Billing',
      items: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, digital wallets (Apple Pay, Google Pay), and bank transfers. All payments are processed securely with 256-bit encryption.',
        },
        {
          q: 'Is my payment information secure?',
          a: 'Absolutely. We use industry-standard SSL encryption and comply with PCI DSS standards. Your payment information is never stored on our servers.',
        },
        {
          q: 'Can I get an invoice for my order?',
          a: 'Yes, invoices are automatically generated and emailed to you after purchase. You can also download invoices from your account dashboard under "Billing History".',
        },
        {
          q: 'Do you offer installment payment plans?',
          a: 'Yes, for orders over Rs 5,000, we offer flexible installment plans through our financing partners. Interest-free options are available for qualified customers.',
        },
      ],
    },
    {
      category: 'Returns & Refunds',
      items: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day money-back guarantee on all items. Products must be in original condition with all packaging and accessories. Simply initiate a return through your account dashboard.',
        },
        {
          q: 'How long do refunds take?',
          a: 'Once we receive and inspect your return, refunds are processed within 5-7 business days. The refund will appear in your original payment method.',
        },
        {
          q: 'Do you provide free returns?',
          a: 'For most items, yes! We provide a prepaid return label. In rare cases where free returns aren\'t available, you\'ll be informed before purchasing.',
        },
        {
          q: 'Can I exchange a product instead of returning it?',
          a: 'Absolutely! You can request an exchange for a different size, color, or product. Simply initiate the exchange process, and we\'ll ship the replacement immediately.',
        },
      ],
    },
    {
      category: 'Account & Profile',
      items: [
        {
          q: 'How do I create an account?',
          a: 'Click "Sign Up" on the homepage, enter your email and password, and verify your email address. You can also sign up using your Google or Apple account.',
        },
        {
          q: 'How do I reset my password?',
          a: 'Click "Forgot Password" on the login page, enter your email, and follow the reset instructions sent to your inbox. The link is valid for 24 hours.',
        },
        {
          q: 'How do I update my profile information?',
          a: 'Go to your account settings, click "Edit Profile", and update your information. Changes are saved immediately.',
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, you can request account deletion from your account settings. Please note that this action is permanent and cannot be undone.',
        },
      ],
    },
    {
      category: 'Products & Inventory',
      items: [
        {
          q: 'Are your prices competitive?',
          a: 'We pride ourselves on offering the best value for money. If you find a lower price elsewhere, we\'ll match it! Contact our sales team with proof of the lower price.',
        },
        {
          q: 'How do I know if a product is in stock?',
          a: 'Product availability is shown on each product page. "In Stock" items ship within 1 business day. Pre-order items have an estimated delivery date.',
        },
        {
          q: 'Do you offer bulk discounts?',
          a: 'Yes! For orders over 50 units, we offer special bulk pricing. Contact our B2B sales team at bulk@novamart.com for custom quotes.',
        },
        {
          q: 'Can I pre-order upcoming products?',
          a: 'Yes, we accept pre-orders for upcoming products. You\'ll receive the item as soon as it\'s in stock, often before general availability.',
        },
      ],
    },
  ];

  const contactChannels = [
    {
      icon: FiMail,
      title: 'Email Support',
      description: 'Get detailed responses to complex inquiries',
      contact: 'support@novamart.com',
      responseTime: '2-4 hours',
    },
    {
      icon: FiPhone,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      contact: '+92 (123) 456-7890',
      responseTime: 'Immediate',
    },
    {
      icon: FiMessageSquare,
      title: 'Live Chat',
      description: 'Real-time chat support during business hours',
      contact: 'Available 9 AM - 9 PM (Mon-Fri)',
      responseTime: 'Instant',
    },
    {
      icon: FiClock,
      title: 'WhatsApp Support',
      description: 'Quick support via WhatsApp messaging',
      contact: '+92 (123) 456-7890',
      responseTime: '1-2 hours',
    },
  ];

  const resources = [
    {
      icon: FiPackage,
      title: 'Shipping Guide',
      description: 'Learn about our shipping options and timelines',
    },
    {
      icon: FiCreditCard,
      title: 'Payment Methods',
      description: 'Explore all available payment options',
    },
    {
      icon: FiCheckCircle,
      title: 'Quality Assurance',
      description: 'Our commitment to product quality',
    },
    {
      icon: FiUser,
      title: 'Privacy Policy',
      description: 'How we protect your personal data',
    },
    {
      icon: FiTrendingUp,
      title: 'Bulk Orders',
      description: 'Special pricing for wholesale purchases',
    },
    {
      icon: FiAlertCircle,
      title: 'Terms & Conditions',
      description: 'Our policies and terms of service',
    },
  ];

  const filteredFAQs = faqs.map(category => ({
    ...category,
    items: category.items.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.items.length > 0);

  return (
    <div className={`min-h-screen pb-10 ${
      theme === 'dark'
        ? 'bg-neutral-950 text-white'
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* HEADER */}
      <div className={`${
        theme === 'dark'
          ? 'bg-gradient-to-r from-neutral-900 to-neutral-800 border-neutral-800'
          : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
      } border-b py-12 px-4`}>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">How Can We Help?</h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
          }`}>
            Find answers to common questions or contact our support team
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative mb-8">
          <FiSearch className="absolute left-4 top-3.5 text-amber-500" size={20} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none transition ${
              theme === 'dark'
                ? 'bg-neutral-900 border-neutral-800 text-white focus:border-amber-500'
                : 'bg-white border-purple-200 text-gray-900 focus:border-amber-500'
            }`}
          />
        </div>
      </div>

      {/* CONTACT CHANNELS */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactChannels.map((channel, i) => {
            const Icon = channel.icon;
            return (
              <div
                key={i}
                className={`p-5 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-800 hover:border-amber-500'
                    : 'bg-white border-purple-200 hover:border-amber-500 shadow-md'
                } transition cursor-pointer hover:shadow-lg`}
              >
                <Icon className="text-amber-500 mb-3" size={24} />
                <h3 className="font-bold text-sm mb-1">{channel.title}</h3>
                <p className={`text-xs mb-3 ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  {channel.description}
                </p>
                <div className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  {channel.contact}
                </div>
                <div className={`text-xs mt-2 ${
                  theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
                }`}>
                  {channel.responseTime}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

        {filteredFAQs.length === 0 ? (
          <div className={`text-center py-8 rounded-lg border ${
            theme === 'dark'
              ? 'bg-neutral-900 border-neutral-800'
              : 'bg-white border-purple-200'
          }`}>
            <FiAlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
            <p className={theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}>
              No results found. Try a different search term.
            </p>
          </div>
        ) : (
          filteredFAQs.map((category, catIdx) => (
            <div key={catIdx} className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-amber-500">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg overflow-hidden transition ${
                      theme === 'dark'
                        ? 'border-neutral-800 bg-neutral-900'
                        : 'border-purple-200 bg-white shadow-sm'
                    }`}
                  >
                    <button
                      onClick={() =>
                        setExpandedFAQ(expandedFAQ === `${catIdx}-${idx}` ? null : `${catIdx}-${idx}`)
                      }
                      className={`w-full px-5 py-4 flex justify-between items-center hover:bg-opacity-80 transition ${
                        theme === 'dark'
                          ? 'hover:bg-neutral-800'
                          : 'hover:bg-purple-50'
                      }`}
                    >
                      <span className="font-semibold text-left">{item.q}</span>
                      {expandedFAQ === `${catIdx}-${idx}` ? (
                        <FiChevronUp className="text-amber-500 flex-shrink-0 ml-2" />
                      ) : (
                        <FiChevronDown className={`${
                          theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                        } flex-shrink-0 ml-2`} />
                      )}
                    </button>

                    {expandedFAQ === `${catIdx}-${idx}` && (
                      <div className={`px-5 py-4 border-t ${
                        theme === 'dark'
                          ? 'border-neutral-800 bg-neutral-950'
                          : 'border-purple-100 bg-gray-50'
                      }`}>
                        <p className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}>
                          {item.a}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* RESOURCES */}
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource, i) => {
            const Icon = resource.icon;
            return (
              <div
                key={i}
                className={`p-6 rounded-xl border cursor-pointer transition hover:shadow-lg ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-800 hover:border-amber-500'
                    : 'bg-white border-purple-200 hover:border-amber-500 shadow-md'
                }`}
              >
                <Icon className="text-amber-500 mb-3" size={28} />
                <h3 className="font-bold mb-2">{resource.title}</h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  {resource.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className={`mt-16 rounded-xl p-8 text-center max-w-4xl mx-auto ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-800'
          : 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200'
      }`}>
        <h3 className="text-xl font-bold mb-2">Didn't find what you need?</h3>
        <p className={`${
          theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
        } mb-4`}>
          Our support team is here to help. Reach out anytime!
        </p>
        <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
          Contact Support
        </button>
      </div>
    </div>
  );
}
