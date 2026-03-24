export const PLAN_LEVELS = {
  STARTER: 0,
  LITE: 1,
  STANDARD: 2,
  PROFESSIONAL: 3,
  ENTERPRISE: 4,
} as const;

export const PLANS = [
  {
    level: 0,
    name: 'Starter',
    features: {
      csvExport: false,
      downloadAll: false,
      landingPage: false,
      judging: false,
      customBranding: false,
    }
  },
  {
    level: 1,
    name: 'Lite',
    features: {
      csvExport: true,
      downloadAll: true,
      landingPage: false,
      judging: false,
      customBranding: false,
    }
  },
  {
    level: 2,
    name: 'Standard',
    features: {
      csvExport: true,
      downloadAll: true,
      landingPage: true,
      judging: false,
      customBranding: false,
    }
  },
  {
    level: 3,
    name: 'Professional',
    features: {
      csvExport: true,
      downloadAll: true,
      landingPage: true,
      judging: false,
      customBranding: true,
    }
  },
  {
    level: 4,
    name: 'Enterprise',
    features: {
      csvExport: true,
      downloadAll: true,
      landingPage: true,
      judging: true,
      customBranding: true,
    }
  }
];

export function getPlanConfig(level: number = 0) {
  return PLANS.find(p => p.level === level) || PLANS[0];
}

export function canAccessCSV(level: number = 0) {
  return getPlanConfig(level).features.csvExport;
}

export function canDownloadAll(level: number = 0) {
  return getPlanConfig(level).features.downloadAll;
}

export function canAccessLandingPage(level: number = 0) {
  return getPlanConfig(level).features.landingPage;
}

export function canAccessJudging(level: number = 0) {
  return getPlanConfig(level).features.judging;
}

export function canAccessCustomBranding(level: number = 0) {
  return getPlanConfig(level).features.customBranding;
}
