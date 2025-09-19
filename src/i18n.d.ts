
// DamDoh Microservice-Based Internationalization Type Definitions
// This file provides comprehensive TypeScript type safety for all translation keys
// across the agricultural supply chain platform's microservice architecture.

// Core microservice message types
export interface AuthMessages {
  signIn: {
    title: string;
    welcome: string;
    description: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    forgotPasswordLink: string;
    signInButton: string;
    signingInButton: string;
    noAccountPrompt: string;
    signUpLink: string;
  };
  signUp: {
    title: string;
    welcome: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    roleLabel: string;
    rolePlaceholder: string;
    confirmPasswordLabel: string;
    signUpButton: string;
    creatingAccountButton: string;
    alreadyHaveAccountPrompt: string;
    signInLink: string;
  };
  passwordReset: {
    title: string;
    description: string;
    emailLabel: string;
    sendResetLinkButton: string;
    backToSignInLink: string;
  };
  errors: {
    emailInUse: string;
    invalidEmail: string;
    weakPassword: string;
    default: string;
    invalidCredential: string;
    userDisabled: string;
  };
  success: {
    signUp: {
      title: string;
      description: string;
    };
    signIn: {
      title: string;
      description: string;
    };
    passwordReset: {
      title: string;
      description: string;
    };
  };
  stakeholderRoles: Record<string, string>;
}

export interface CommonMessages {
  navigation: {
    home: string;
    dashboard: string;
    profile: string;
    settings: string;
    logout: string;
    search: {
      placeholder: string;
      noResults: string;
    };
  };
  ui: {
    buttons: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      create: string;
      update: string;
      submit: string;
      close: string;
      back: string;
      next: string;
      previous: string;
      loading: string;
    };
    forms: {
      required: string;
      optional: string;
      validation: {
        email: string;
        required: string;
        minLength: string;
        maxLength: string;
        pattern: string;
      };
    };
    status: {
      loading: string;
      success: string;
      error: string;
      warning: string;
      info: string;
    };
    pagination: {
      previous: string;
      next: string;
      page: string;
      of: string;
      showing: string;
      to: string;
      entries: string;
    };
  };
  time: {
    now: string;
    ago: string;
    justNow: string;
    minute: string;
    minutes: string;
    hour: string;
    hours: string;
    day: string;
    days: string;
    week: string;
    weeks: string;
    month: string;
    months: string;
    year: string;
    years: string;
  };
  currency: {
    symbol: string;
    code: string;
    format: string;
  };
  units: {
    weight: {
      kg: string;
      ton: string;
      gram: string;
      pound: string;
    };
    area: {
      hectare: string;
      acre: string;
      squareMeter: string;
    };
    volume: {
      liter: string;
      gallon: string;
      cubicMeter: string;
    };
  };
}

export interface DashboardMessages {
  title: string;
  subtitle: string;
  welcome: string;
  stats: {
    totalUsers: string;
    activeUsers: string;
    totalTransactions: string;
    revenue: string;
  };
  navigation: {
    overview: string;
    analytics: string;
    users: string;
    transactions: string;
    reports: string;
  };
  widgets: {
    recentActivity: string;
    quickActions: string;
    notifications: string;
    alerts: string;
  };
  filters: {
    today: string;
    yesterday: string;
    lastWeek: string;
    lastMonth: string;
    customRange: string;
  };
}

export interface FarmManagementMessages {
  title: string;
  crops: {
    title: string;
    addCrop: string;
    editCrop: string;
    deleteCrop: string;
    cropName: string;
    variety: string;
    plantingDate: string;
    harvestDate: string;
    area: string;
    status: string;
    yield: string;
  };
  fields: {
    title: string;
    addField: string;
    editField: string;
    deleteField: string;
    fieldName: string;
    location: string;
    size: string;
    soilType: string;
    irrigation: string;
  };
  operations: {
    title: string;
    schedule: string;
    history: string;
    types: {
      planting: string;
      irrigation: string;
      fertilization: string;
      pestControl: string;
      harvesting: string;
      maintenance: string;
    };
  };
  monitoring: {
    title: string;
    weather: string;
    soilMoisture: string;
    cropHealth: string;
    alerts: string;
  };
}

export interface MarketplaceMessages {
  title: string;
  listings: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    productName: string;
    description: string;
    price: string;
    quantity: string;
    category: string;
    location: string;
    images: string;
  };
  orders: {
    title: string;
    pending: string;
    confirmed: string;
    shipped: string;
    delivered: string;
    cancelled: string;
  };
  negotiations: {
    title: string;
    start: string;
    messages: string;
    offers: string;
    accept: string;
    reject: string;
    counter: string;
  };
  categories: Record<string, string>;
}

export interface FinancialMessages {
  title: string;
  loans: {
    title: string;
    apply: string;
    status: string;
    amount: string;
    interestRate: string;
    term: string;
    purpose: string;
    collateral: string;
  };
  insurance: {
    title: string;
    policies: string;
    claims: string;
    coverage: string;
    premium: string;
    deductible: string;
  };
  payments: {
    title: string;
    history: string;
    pending: string;
    completed: string;
    failed: string;
  };
  analytics: {
    title: string;
    revenue: string;
    expenses: string;
    profit: string;
    cashFlow: string;
  };
}

export interface TraceabilityMessages {
  title: string;
  batches: {
    title: string;
    create: string;
    track: string;
    batchId: string;
    product: string;
    quantity: string;
    origin: string;
    destination: string;
  };
  certificates: {
    title: string;
    organic: string;
    fairTrade: string;
    gmoFree: string;
    sustainable: string;
  };
  blockchain: {
    title: string;
    verified: string;
    immutable: string;
    transparent: string;
  };
  qr: {
    title: string;
    generate: string;
    scan: string;
    share: string;
  };
}

export interface NetworkMessages {
  title: string;
  connections: {
    title: string;
    pending: string;
    accepted: string;
    blocked: string;
    sendRequest: string;
    acceptRequest: string;
    declineRequest: string;
  };
  groups: {
    title: string;
    create: string;
    join: string;
    leave: string;
    members: string;
    discussions: string;
  };
  messaging: {
    title: string;
    compose: string;
    inbox: string;
    sent: string;
    drafts: string;
    archive: string;
  };
  collaboration: {
    title: string;
    projects: string;
    tasks: string;
    shared: string;
    permissions: string;
  };
}

export interface KnowledgeHubMessages {
  title: string;
  articles: {
    title: string;
    create: string;
    edit: string;
    publish: string;
    categories: Record<string, string>;
  };
  tutorials: {
    title: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    video: string;
    text: string;
  };
  experts: {
    title: string;
    directory: string;
    consultations: string;
    schedule: string;
    reviews: string;
  };
  resources: {
    title: string;
    documents: string;
    tools: string;
    calculators: string;
    templates: string;
  };
}

export interface ForumsMessages {
  title: string;
  categories: Record<string, string>;
  posts: {
    title: string;
    create: string;
    reply: string;
    edit: string;
    delete: string;
    pin: string;
    lock: string;
  };
  topics: {
    title: string;
    popular: string;
    recent: string;
    unanswered: string;
    solved: string;
  };
  moderation: {
    title: string;
    reports: string;
    warnings: string;
    bans: string;
  };
}

export interface NotificationsMessages {
  title: string;
  types: {
    system: string;
    user: string;
    market: string;
    weather: string;
    compliance: string;
  };
  settings: {
    title: string;
    email: string;
    push: string;
    sms: string;
    frequency: string;
  };
  actions: {
    markAsRead: string;
    markAllAsRead: string;
    delete: string;
    archive: string;
  };
}

export interface SearchMessages {
  title: string;
  filters: {
    all: string;
    users: string;
    products: string;
    companies: string;
    articles: string;
    forums: string;
  };
  results: {
    found: string;
    noResults: string;
    tryDifferent: string;
    suggestions: string;
  };
  advanced: {
    title: string;
    location: string;
    category: string;
    priceRange: string;
    dateRange: string;
  };
}

export interface AnalyticsMessages {
  title: string;
  overview: {
    title: string;
    kpis: string;
    trends: string;
    comparisons: string;
  };
  reports: {
    title: string;
    generate: string;
    schedule: string;
    export: string;
    share: string;
  };
  charts: {
    title: string;
    line: string;
    bar: string;
    pie: string;
    area: string;
  };
  metrics: {
    title: string;
    custom: string;
    predefined: string;
    realTime: string;
  };
}

export interface ComplianceMessages {
  title: string;
  regulations: {
    title: string;
    local: string;
    international: string;
    updates: string;
  };
  certifications: {
    title: string;
    apply: string;
    renew: string;
    audit: string;
    status: string;
  };
  reporting: {
    title: string;
    generate: string;
    submit: string;
    history: string;
  };
  violations: {
    title: string;
    report: string;
    investigate: string;
    resolve: string;
  };
}

export interface SustainabilityMessages {
  title: string;
  metrics: {
    title: string;
    carbonFootprint: string;
    waterUsage: string;
    energyConsumption: string;
    wasteReduction: string;
  };
  initiatives: {
    title: string;
    organic: string;
    regenerative: string;
    conservation: string;
    community: string;
  };
  reporting: {
    title: string;
    generate: string;
    share: string;
    benchmarks: string;
  };
  goals: {
    title: string;
    set: string;
    track: string;
    achieve: string;
  };
}

// Main IntlMessages interface combining all microservices
export interface IntlMessages {
  // Core microservices
  auth: AuthMessages;
  common: CommonMessages;
  dashboard: DashboardMessages;

  // Agricultural microservices
  farmManagement: FarmManagementMessages;
  marketplace: MarketplaceMessages;
  financial: FinancialMessages;
  traceability: TraceabilityMessages;

  // Social microservices
  network: NetworkMessages;
  knowledgeHub: KnowledgeHubMessages;
  forums: ForumsMessages;

  // Operational microservices
  notifications: NotificationsMessages;
  search: SearchMessages;
  analytics: AnalyticsMessages;

  // Compliance microservices
  compliance: ComplianceMessages;
  sustainability: SustainabilityMessages;
}

// Note: Global IntlMessages interface is handled by next-intl automatically
// when this file is imported. No need for manual global declaration.
