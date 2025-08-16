export interface Event {
  id: string;
  name: string;
  type:
    | 'wedding'
    | 'graduation'
    | 'birthday'
    | 'anniversary'
    | 'baby-shower'
    | 'retirement'
    | 'other';
  description?: string;
  eventDate: string;
  createdAt: string;
  totalBudget: number;
  totalSpent: number;
  spentPercentage: number;
  status: 'on-track' | 'over-budget' | 'under-budget' | 'completed';
  categories: Array<{
    id: string;
    name: string;
    budgeted: number;
    spent: number;
    percentage: number;
    color: string;
  }>;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    name: "Sarah & John's Wedding",
    type: 'wedding',
    description: 'A beautiful celebration of love in the garden',
    eventDate: '2024-06-15',
    createdAt: '2024-01-01T00:00:00Z',
    totalBudget: 12000,
    totalSpent: 8500,
    spentPercentage: 71,
    status: 'on-track',
    categories: [
      {
        id: '1',
        name: 'Venue & Reception',
        budgeted: 4800,
        spent: 4000,
        percentage: 83,
        color: '#059669',
      },
      {
        id: '2',
        name: 'Catering & Beverages',
        budgeted: 3600,
        spent: 2800,
        percentage: 78,
        color: '#10b981',
      },
      {
        id: '3',
        name: 'Photography & Video',
        budgeted: 1200,
        spent: 900,
        percentage: 75,
        color: '#7C3AED',
      },
      {
        id: '4',
        name: 'Attire',
        budgeted: 960,
        spent: 800,
        percentage: 83,
        color: '#EC4899',
      },
      {
        id: '5',
        name: 'Flowers & Decorations',
        budgeted: 840,
        spent: 200,
        percentage: 24,
        color: '#34d399',
      },
      {
        id: '6',
        name: 'Music & Entertainment',
        budgeted: 600,
        spent: 0,
        percentage: 0,
        color: '#EA580C',
      },
    ],
  },
  {
    id: '2',
    name: "Emma's Graduation Party",
    type: 'graduation',
    description: 'Celebrating 4 years of hard work and achievement',
    eventDate: '2024-05-20',
    createdAt: '2024-02-15T00:00:00Z',
    totalBudget: 3500,
    totalSpent: 1200,
    spentPercentage: 34,
    status: 'under-budget',
    categories: [
      {
        id: '1',
        name: 'Venue Rental',
        budgeted: 1200,
        spent: 800,
        percentage: 67,
        color: '#059669',
      },
      {
        id: '2',
        name: 'Food & Catering',
        budgeted: 1000,
        spent: 400,
        percentage: 40,
        color: '#10b981',
      },
      {
        id: '3',
        name: 'Decorations & Theme',
        budgeted: 500,
        spent: 0,
        percentage: 0,
        color: '#7C3AED',
      },
      {
        id: '4',
        name: 'Photography',
        budgeted: 400,
        spent: 0,
        percentage: 0,
        color: '#EC4899',
      },
      {
        id: '5',
        name: 'Invitations & Printing',
        budgeted: 250,
        spent: 0,
        percentage: 0,
        color: '#34d399',
      },
      {
        id: '6',
        name: 'Entertainment & Music',
        budgeted: 150,
        spent: 0,
        percentage: 0,
        color: '#EA580C',
      },
    ],
  },
  {
    id: '3',
    name: "Mom's 60th Birthday Celebration",
    type: 'birthday',
    description: 'A milestone birthday celebration for an amazing woman',
    eventDate: '2024-08-10',
    createdAt: '2024-03-01T00:00:00Z',
    totalBudget: 2500,
    totalSpent: 650,
    spentPercentage: 26,
    status: 'on-track',
    categories: [
      {
        id: '1',
        name: 'Venue & Space',
        budgeted: 800,
        spent: 500,
        percentage: 63,
        color: '#059669',
      },
      {
        id: '2',
        name: 'Catering & Cake',
        budgeted: 900,
        spent: 150,
        percentage: 17,
        color: '#10b981',
      },
      {
        id: '3',
        name: 'Decorations',
        budgeted: 300,
        spent: 0,
        percentage: 0,
        color: '#7C3AED',
      },
      {
        id: '4',
        name: 'Gifts & Surprises',
        budgeted: 400,
        spent: 0,
        percentage: 0,
        color: '#EC4899',
      },
      {
        id: '5',
        name: 'Photography',
        budgeted: 100,
        spent: 0,
        percentage: 0,
        color: '#34d399',
      },
    ],
  },
  {
    id: '4',
    name: "The Johnson's 25th Anniversary",
    type: 'anniversary',
    description: 'Silver anniversary celebration with family and friends',
    eventDate: '2024-09-22',
    createdAt: '2024-01-20T00:00:00Z',
    totalBudget: 5000,
    totalSpent: 2100,
    spentPercentage: 42,
    status: 'on-track',
    categories: [
      {
        id: '1',
        name: 'Venue & Reception',
        budgeted: 2000,
        spent: 1500,
        percentage: 75,
        color: '#059669',
      },
      {
        id: '2',
        name: 'Catering',
        budgeted: 1500,
        spent: 600,
        percentage: 40,
        color: '#10b981',
      },
      {
        id: '3',
        name: 'Photography & Video',
        budgeted: 800,
        spent: 0,
        percentage: 0,
        color: '#7C3AED',
      },
      {
        id: '4',
        name: 'Flowers & Decorations',
        budgeted: 500,
        spent: 0,
        percentage: 0,
        color: '#EC4899',
      },
      {
        id: '5',
        name: 'Entertainment',
        budgeted: 200,
        spent: 0,
        percentage: 0,
        color: '#34d399',
      },
    ],
  },
  {
    id: '5',
    name: 'Baby Shower for Lisa',
    type: 'baby-shower',
    description: 'Welcome party for the newest addition to the family',
    eventDate: '2024-07-05',
    createdAt: '2024-04-10T00:00:00Z',
    totalBudget: 1800,
    totalSpent: 1950,
    spentPercentage: 108,
    status: 'over-budget',
    categories: [
      {
        id: '1',
        name: 'Venue & Setup',
        budgeted: 600,
        spent: 700,
        percentage: 117,
        color: '#059669',
      },
      {
        id: '2',
        name: 'Food & Refreshments',
        budgeted: 500,
        spent: 650,
        percentage: 130,
        color: '#10b981',
      },
      {
        id: '3',
        name: 'Decorations & Theme',
        budgeted: 400,
        spent: 350,
        percentage: 88,
        color: '#7C3AED',
      },
      {
        id: '4',
        name: 'Games & Activities',
        budgeted: 200,
        spent: 150,
        percentage: 75,
        color: '#EC4899',
      },
      {
        id: '5',
        name: 'Gifts & Favors',
        budgeted: 100,
        spent: 100,
        percentage: 100,
        color: '#34d399',
      },
    ],
  },
];

export const getEventIcon = (type: Event['type']): string => {
  const icons = {
    wedding: '💒',
    graduation: '🎓',
    birthday: '🎂',
    anniversary: '💝',
    'baby-shower': '🍼',
    retirement: '🎉',
    other: '🎊',
  };
  return icons[type];
};

export const getEventTypeLabel = (type: Event['type']): string => {
  const labels = {
    wedding: 'Wedding',
    graduation: 'Graduation',
    birthday: 'Birthday',
    anniversary: 'Anniversary',
    'baby-shower': 'Baby Shower',
    retirement: 'Retirement',
    other: 'Other Event',
  };
  return labels[type];
};

export const getEventStatusColor = (status: Event['status']) => {
  const colors = {
    'on-track': {
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-200',
    },
    'over-budget': {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    'under-budget': {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      border: 'border-primary-200',
    },
    completed: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
    },
  };
  return colors[status];
};
