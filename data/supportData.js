// data/supportData.js
export const FAQ_DATA = [
  {
    id: '1',
    question: 'How long do transaction approvals take?',
    answer: 'Most wallet transactions and funding approvals process instantly. High-value asset verification flags can occasionally take up to 24 business hours.',
  },
  {
    id: '2',
    question: 'How do I secure my wallet transaction PIN?',
    answer: 'Navigate to your Profile tab, choose "Security & Privacy," and select "Change Transaction PIN." Never share this 4-digit code with anyone.',
  },
  {
    id: '3',
    question: 'Can I link multiple deposit accounts?',
    answer: 'Yes, Evault allows you to securely attach multiple backed institutional accounts via your settings panel workflow.',
  }
];

export const SOCIAL_PROFILES = [
  { id: 'tw', platform: 'Twitter / X', handle: '@EvaultHQ', url: 'https://x.com/evault' },
  { id: 'li', platform: 'LinkedIn', handle: 'Evault Technologies', url: 'https://linkedin.com/company/evault' },
  { id: 'ig', platform: 'Instagram', handle: '@evault_app', url: 'https://instagram.com/evault' }
];

export const WHATSAPP_CONFIG = {
  phoneNumber: '+2348140332887', // Replace with your verified company desk string
  defaultMessage: 'Hello Evault Support Desk, I need an assistance.'
};