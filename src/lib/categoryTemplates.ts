import type { EventType } from '@/types/Event';

/**
 * Category template structure for pre-defined categories
 */
export interface CategoryTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * Mapping of event types to their suggested categories
 */
export interface EventTypeCategoryMapping {
  eventType: EventType;
  categories: CategoryTemplate[];
}

/**
 * Category templates for Wedding events
 */
const weddingCategories: CategoryTemplate[] = [
  {
    id: 'wedding-venue',
    name: 'Venue & Reception',
    icon: '🏛️',
    color: '#059669',
    description: 'Ceremony and reception venue rental fees',
  },
  {
    id: 'wedding-catering',
    name: 'Catering & Beverages',
    icon: '🍰',
    color: '#DC2626',
    description: 'Food, drinks, cake, and catering services',
  },
  {
    id: 'wedding-photography',
    name: 'Photography & Video',
    icon: '📸',
    color: '#2563EB',
    description: 'Professional photography and videography services',
  },
  {
    id: 'wedding-attire',
    name: 'Attire',
    icon: '👗',
    color: '#9333EA',
    description: 'Wedding dress, suit, accessories, and alterations',
  },
  {
    id: 'wedding-flowers',
    name: 'Flowers & Decorations',
    icon: '💐',
    color: '#DB2777',
    description: 'Floral arrangements, centerpieces, and decorations',
  },
  {
    id: 'wedding-entertainment',
    name: 'Music & Entertainment',
    icon: '🎵',
    color: '#EA580C',
    description: 'DJ, band, or other entertainment services',
  },
];

/**
 * Category templates for Graduation events
 */
const graduationCategories: CategoryTemplate[] = [
  {
    id: 'graduation-venue',
    name: 'Venue Rental',
    icon: '🏛️',
    color: '#059669',
    description: 'Space rental for graduation celebration',
  },
  {
    id: 'graduation-catering',
    name: 'Food & Catering',
    icon: '🍕',
    color: '#DC2626',
    description: 'Meals, snacks, and catering services',
  },
  {
    id: 'graduation-decorations',
    name: 'Decorations & Theme',
    icon: '🎓',
    color: '#2563EB',
    description: 'Graduation-themed decorations and setup',
  },
  {
    id: 'graduation-photography',
    name: 'Photography',
    icon: '📸',
    color: '#9333EA',
    description: 'Professional photos and photo booth',
  },
  {
    id: 'graduation-invitations',
    name: 'Invitations & Printing',
    icon: '✉️',
    color: '#DB2777',
    description: 'Invitations, programs, and printed materials',
  },
  {
    id: 'graduation-entertainment',
    name: 'Entertainment & Music',
    icon: '🎵',
    color: '#EA580C',
    description: 'Music, entertainment, and activities',
  },
];

/**
 * Category templates for Birthday events
 */
const birthdayCategories: CategoryTemplate[] = [
  {
    id: 'birthday-venue',
    name: 'Venue & Space',
    icon: '🏠',
    color: '#059669',
    description: 'Party venue or space rental',
  },
  {
    id: 'birthday-catering',
    name: 'Catering & Cake',
    icon: '🎂',
    color: '#DC2626',
    description: 'Food, drinks, and birthday cake',
  },
  {
    id: 'birthday-decorations',
    name: 'Decorations',
    icon: '🎈',
    color: '#2563EB',
    description: 'Balloons, banners, and party decorations',
  },
  {
    id: 'birthday-gifts',
    name: 'Gifts & Surprises',
    icon: '🎁',
    color: '#9333EA',
    description: 'Gifts, party favors, and surprises',
  },
  {
    id: 'birthday-entertainment',
    name: 'Entertainment',
    icon: '🎪',
    color: '#EA580C',
    description: 'Entertainers, activities, and games',
  },
  {
    id: 'birthday-photography',
    name: 'Photography',
    icon: '📸',
    color: '#DB2777',
    description: 'Professional photos and memories',
  },
];

/**
 * Category templates for Anniversary events
 */
const anniversaryCategories: CategoryTemplate[] = [
  {
    id: 'anniversary-venue',
    name: 'Venue & Reception',
    icon: '🏛️',
    color: '#059669',
    description: 'Celebration venue and reception space',
  },
  {
    id: 'anniversary-catering',
    name: 'Catering',
    icon: '🍽️',
    color: '#DC2626',
    description: 'Food, drinks, and catering services',
  },
  {
    id: 'anniversary-photography',
    name: 'Photography & Video',
    icon: '📸',
    color: '#2563EB',
    description: 'Professional photos and videography',
  },
  {
    id: 'anniversary-flowers',
    name: 'Flowers & Decorations',
    icon: '💐',
    color: '#DB2777',
    description: 'Floral arrangements and decorations',
  },
  {
    id: 'anniversary-entertainment',
    name: 'Entertainment',
    icon: '🎵',
    color: '#EA580C',
    description: 'Music and entertainment services',
  },
];

/**
 * Category templates for Baby Shower events
 */
const babyShowerCategories: CategoryTemplate[] = [
  {
    id: 'babyshower-venue',
    name: 'Venue & Setup',
    icon: '🏠',
    color: '#059669',
    description: 'Party venue and setup costs',
  },
  {
    id: 'babyshower-catering',
    name: 'Food & Refreshments',
    icon: '🍰',
    color: '#DC2626',
    description: 'Food, drinks, and desserts',
  },
  {
    id: 'babyshower-decorations',
    name: 'Decorations & Theme',
    icon: '🎈',
    color: '#2563EB',
    description: 'Baby shower themed decorations',
  },
  {
    id: 'babyshower-games',
    name: 'Games & Activities',
    icon: '🎮',
    color: '#9333EA',
    description: 'Games, activities, and entertainment',
  },
  {
    id: 'babyshower-favors',
    name: 'Gifts & Favors',
    icon: '🎁',
    color: '#DB2777',
    description: 'Party favors and thank you gifts',
  },
];

/**
 * Category templates for Retirement events
 */
const retirementCategories: CategoryTemplate[] = [
  {
    id: 'retirement-venue',
    name: 'Venue Rental',
    icon: '🏛️',
    color: '#059669',
    description: 'Celebration venue rental',
  },
  {
    id: 'retirement-catering',
    name: 'Catering',
    icon: '🍽️',
    color: '#DC2626',
    description: 'Food and beverage services',
  },
  {
    id: 'retirement-decorations',
    name: 'Decorations',
    icon: '🎈',
    color: '#2563EB',
    description: 'Retirement themed decorations',
  },
  {
    id: 'retirement-gifts',
    name: 'Gifts & Awards',
    icon: '🎁',
    color: '#9333EA',
    description: 'Retirement gifts and awards',
  },
  {
    id: 'retirement-entertainment',
    name: 'Entertainment',
    icon: '🎵',
    color: '#EA580C',
    description: 'Music and entertainment',
  },
];

/**
 * Generic category templates for Other event types
 */
const genericCategories: CategoryTemplate[] = [
  {
    id: 'generic-venue',
    name: 'Venue',
    icon: '🏛️',
    color: '#059669',
    description: 'Event venue and space rental',
  },
  {
    id: 'generic-catering',
    name: 'Catering',
    icon: '🍽️',
    color: '#DC2626',
    description: 'Food and beverage services',
  },
  {
    id: 'generic-entertainment',
    name: 'Entertainment',
    icon: '🎵',
    color: '#2563EB',
    description: 'Entertainment and activities',
  },
  {
    id: 'generic-decorations',
    name: 'Decorations',
    icon: '🎈',
    color: '#9333EA',
    description: 'Event decorations and setup',
  },
  {
    id: 'generic-supplies',
    name: 'Supplies',
    icon: '📦',
    color: '#EA580C',
    description: 'General event supplies',
  },
  {
    id: 'generic-miscellaneous',
    name: 'Miscellaneous',
    icon: '📝',
    color: '#DB2777',
    description: 'Other event expenses',
  },
];

/**
 * Complete mapping of all event types to their category templates
 */
const categoryMappings: EventTypeCategoryMapping[] = [
  { eventType: 'wedding', categories: weddingCategories },
  { eventType: 'graduation', categories: graduationCategories },
  { eventType: 'birthday', categories: birthdayCategories },
  { eventType: 'anniversary', categories: anniversaryCategories },
  { eventType: 'baby-shower', categories: babyShowerCategories },
  { eventType: 'retirement', categories: retirementCategories },
  { eventType: 'other', categories: genericCategories },
];

/**
 * Get category templates for a specific event type
 * @param eventType - The type of event
 * @returns Array of category templates for that event type
 */
export function getCategoryTemplates(eventType: EventType): CategoryTemplate[] {
  const mapping = categoryMappings.find((m) => m.eventType === eventType);
  return mapping?.categories || genericCategories;
}

/**
 * Get all category templates across all event types
 * @returns Map of event types to their category templates
 */
export function getAllCategoryTemplates(): Map<EventType, CategoryTemplate[]> {
  const map = new Map<EventType, CategoryTemplate[]>();
  for (const mapping of categoryMappings) {
    map.set(mapping.eventType, mapping.categories);
  }
  return map;
}

/**
 * Get a specific category template by ID
 * @param templateId - The ID of the category template
 * @returns The category template or undefined if not found
 */
export function getCategoryTemplateById(
  templateId: string,
): CategoryTemplate | undefined {
  for (const mapping of categoryMappings) {
    const template = mapping.categories.find((cat) => cat.id === templateId);
    if (template) return template;
  }
  return undefined;
}
