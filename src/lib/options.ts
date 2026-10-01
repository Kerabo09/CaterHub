// Keep in sync with server/src/validate.js
export const EVENT_TYPES = [
  'Weddings & Nuptials', 'Corporate Events', 'Birthdays & Milestones',
  'Social Gatherings & Anniversaries', 'Intimate Dinners & Gatherings',
  'School & Church Banquets', 'Banquets & Major Conventions', 'Holiday & Seasonal Celebrations',
];

export const SERVICE_STYLES = [
  'Buffet Station Setup', 'Formal Plated Courses', 'Packed/Meals Delivery',
  'Cocktail & Grazing Table', 'Live Culinary Station',
];

export const RESPONSE_TIMES = ['1 hour', '2 hours', '4 hours', '12 hours', '24 hours', '2 days'];

export const INQUIRY_STATUS_LABEL: Record<string, string> = {
  new: 'New', read: 'Read', replied: 'Replied', booked: 'Booked', declined: 'Declined', archived: 'Archived',
};
