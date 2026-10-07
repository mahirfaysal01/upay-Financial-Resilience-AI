import {
  FestivalEvent,
  UtsobShieldProfile,
  UtsobProjectionPoint,
  QurbaniSharePlan,
  CustomerFinancialProfile,
} from '../types/financial';

/**
 * Official Festival Calendar for Bangladesh
 * Incorporating lunar observations and cultural milestones
 */
export const FESTIVAL_CALENDAR: FestivalEvent[] = [
  {
    id: 'durga-puja-2026',
    season: 'DURGA_PUJA',
    name: 'Sharodiya Durga Puja',
    nameBn: 'শারদীয় দুর্গাপূজা (আসন্ন দুর্গোৎসব)',
    estimatedDate: '2026-10-20',
    daysAhead: 14,
    isMoonDependent: true,
    typicalCostDefault: 16000,
    description: 'Upcoming grand autumn festival in Bangladesh (Maha Saptami to Bijoya Dashami). Major expenses include festival clothing, puja chada, mandap hopping, and Dashami sweets.',
    descriptionBn: 'চলতি অক্টোবর মাসের আসন্ন শারদীয় দুর্গোৎসব (মহাসপ্তমী থেকে বিজয়া দশমী)। নতুন পোশাক, পূজার চাঁদা ও অঞ্জলি, মণ্ডপ দর্শন, ভ্রমণ এবং বিজয়ার মিষ্টি ও পারিবারিক আপ্যায়ন।',
    bonusExpectedDaysBefore: 3,
  },
  {
    id: 'eid-ul-fitr-2027',
    season: 'EID_UL_FITR',
    name: 'Eid-ul-Fitr',
    nameBn: 'পবিত্র ঈদুল ফিতর',
    estimatedDate: '2027-03-10',
    daysAhead: 88,
    isMoonDependent: true,
    typicalCostDefault: 18000,
    description: 'Expected around 9–10 March 2027 (moon-dependent). Biggest festival shock with shopping, travel home and salami expenses.',
    descriptionBn: 'আনুমানিক ৯–১০ মার্চ ২০২৭ (চাঁদ দেখার ওপর নির্ভরশীল)। কেনাকাটা, বাড়ি ফেরা ও সালামি ঘিরে সবচেয়ে বড় উৎসবকালীন ব্যয়।',
    bonusExpectedDaysBefore: 4,
  },
  {
    id: 'school-admission-2027',
    season: 'SCHOOL_ADMISSION',
    name: 'School Admission & New Academic Term',
    nameBn: 'নতুন শিক্ষাবর্ষ ও স্কুল ভর্তি সেশন',
    estimatedDate: '2027-01-08',
    daysAhead: 28,
    isMoonDependent: false,
    typicalCostDefault: 12000,
    description: 'Annual session fees, school uniforms, books and coaching admissions in early January.',
    descriptionBn: 'জানুয়ারির শুরুতে সেশন ফি, নতুন বই, ইউনিফর্ম ও কোচিং ভর্তির এককালীন চাপ।',
    bonusExpectedDaysBefore: 0,
  },
  {
    id: 'pohela-boishakh-2027',
    season: 'POHELA_BOISHAKH',
    name: 'Pohela Boishakh (Bengali New Year 1434)',
    nameBn: 'পহেলা বৈশাখ (শুভ নববর্ষ ১৪৩৪)',
    estimatedDate: '2027-04-14',
    daysAhead: 123,
    isMoonDependent: false,
    typicalCostDefault: 7500,
    description: 'Cultural festivities, traditional attire, sweets and Boishakhi fair celebrations.',
    descriptionBn: 'বৈশাখী মেলা, ঐতিহ্যবাহী নতুন পোশাক ও পারিবারিক মিষ্টিমুখের উৎসব।',
    bonusExpectedDaysBefore: 5,
  },
  {
    id: 'eid-ul-adha-2027',
    season: 'EID_UL_ADHA',
    name: 'Eid-ul-Adha & Qurbani',
    nameBn: 'পবিত্র ঈদুল আজহা (কোরবানি)',
    estimatedDate: '2027-05-18',
    daysAhead: 157,
    isMoonDependent: true,
    typicalCostDefault: 26000,
    description: 'Cattle haat purchase, animal logistics, butcher fees and Eid-ul-Adha arrangements.',
    descriptionBn: 'পশুর হাটে কোরবানি পশু ক্রয়, ১/৭ গরুর শেয়ার, হাসিল ও কসাই মজুরির বৃহত্তম আর্থিক ধাক্কা।',
    bonusExpectedDaysBefore: 4,
  },
];

/**
 * Customer-specific past festival profiles and shock models
 */
export const SYNTHETIC_CUSTOMER_FESTIVAL_SPENDING: Record<string, {
  totalCost: number;
  bonusAmount: number;
  bonusDaysBefore: number;
  breakdown: { category: string; categoryBn: string; amount: number; timingDaysBefore: number; notes: string }[];
}> = {
  C006: { // Farhan Kabir - Sudden Spending User
    totalCost: 18000,
    bonusAmount: 15000,
    bonusDaysBefore: 4,
    breakdown: [
      {
        category: 'Eid Shopping',
        categoryBn: 'নতুন পোশাক ও পরিবারের কেনাকাটা',
        amount: 8500,
        timingDaysBefore: 22,
        notes: 'কেনাকাটা শুরু হয় ঈদের ৩ সপ্তাহ আগে, যখন বোনাস বা বেতনের কোনো টাকা হাতে থাকে না।',
      },
      {
        category: 'Travel Home & Tickets',
        categoryBn: 'বাড়ি ফেরা ও অগ্রিম ট্রেনের/বাসের টিকিট',
        amount: 3200,
        timingDaysBefore: 15,
        notes: 'রেলওয়ে অ্যাপ বা বাস কাউন্টারে ঈদের ১০-১৫ দিন আগেই টিকিট কিনতে হয়।',
      },
      {
        category: 'Salami & Gift Money',
        categoryBn: 'ছোটদের সালামি ও স্বজনদের উপহার',
        amount: 4300,
        timingDaysBefore: 1,
        notes: 'ঈদের দিন ও চাঁদ রাতে নগদ ও উপায় অ্যাপের মাধ্যমে দেওয়া উপহার।',
      },
      {
        category: 'Feast & Groceries',
        categoryBn: 'সেমাই, মিষ্টি ও পারিবারিক ভোজ',
        amount: 2000,
        timingDaysBefore: 3,
        notes: 'ঈদের বাজারের বিশেষ খাদ্যসামগ্রী ও অতিথি আপ্যায়ন।',
      },
    ],
  },
  C001: { // Rahim Hasan - Month-End Spender
    totalCost: 14000,
    bonusAmount: 12000,
    bonusDaysBefore: 4,
    breakdown: [
      {
        category: 'Festival Shopping',
        categoryBn: 'পোশাক ও কেনাকাটা',
        amount: 6500,
        timingDaysBefore: 20,
        notes: 'পরিবার ও নিজের জন্য উৎসবের পোশাক।',
      },
      {
        category: 'Travel Home',
        categoryBn: 'বাড়ি ফেরার যাতায়াত খরচ',
        amount: 2500,
        timingDaysBefore: 12,
        notes: 'বাসের টিকিট ও ভ্রমণ।',
      },
      {
        category: 'Gifts & Salami',
        categoryBn: 'সালামি ও উৎসবের উপহার',
        amount: 3200,
        timingDaysBefore: 1,
        notes: 'স্বজনদের উপহার।',
      },
      {
        category: 'Feast',
        categoryBn: 'পারিবারিক খাবার ও মিষ্টিমুখ',
        amount: 1800,
        timingDaysBefore: 2,
        notes: 'উৎসবের রান্নাবান্না।',
      },
    ],
  },
  C002: { // Nusrat Jahan - Stable Saver
    totalCost: 16000,
    bonusAmount: 20000,
    bonusDaysBefore: 5,
    breakdown: [
      {
        category: 'Festival Shopping',
        categoryBn: 'পোশাক ও উপহার',
        amount: 7000,
        timingDaysBefore: 18,
        notes: 'অগ্রিম উপহার সামগ্রী।',
      },
      {
        category: 'Travel',
        categoryBn: 'পরিবারের সাথে ভ্রমণ',
        amount: 3000,
        timingDaysBefore: 10,
        notes: 'যাতায়াত।',
      },
      {
        category: 'Gifts',
        categoryBn: 'উৎসবের সালামি ও মিষ্টিমুখ',
        amount: 4000,
        timingDaysBefore: 1,
        notes: 'উপহার।',
      },
      {
        category: 'Feast',
        categoryBn: 'পারিবারিক আপ্যায়ন',
        amount: 2000,
        timingDaysBefore: 2,
        notes: 'উৎসব আয়োজন।',
      },
    ],
  },
};

/**
 * Dedicated Durga Puja breakdown
 */
const DURGA_PUJA_SPENDING = {
  totalCost: 16000,
  bonusAmount: 12000,
  bonusDaysBefore: 3,
  breakdown: [
    {
      category: 'Puja Clothing & Shopping',
      categoryBn: 'নতুন পোশাক ও পারিবারিক শপিং',
      amount: 6500,
      timingDaysBefore: 7,
      notes: 'পূজার নতুন জামাকাপড় ও স্বজনদের উপহারসামগ্রী ক্রয়।',
    },
    {
      category: 'Mandap Visits & Travel',
      categoryBn: 'মণ্ডপ দর্শন, খাবার ও যাতায়াত',
      amount: 3800,
      timingDaysBefore: 3,
      notes: 'সপ্তমী থেকে নবমী পর্যন্ত ঢাকা ও ঢাকার বাইরের মণ্ডপ পরিক্রমা ও খাবার।',
    },
    {
      category: 'Puja Chada & Anjali',
      categoryBn: 'পূজার চাঁদা, অঞ্জলি ও উপহার',
      amount: 3400,
      timingDaysBefore: 5,
      notes: 'পারিবারিক বা স্থানীয় পূজা মণ্ডপে চাঁদা ও অঞ্জলির অর্ঘ্য।',
    },
    {
      category: 'Bijoya Dashami Feast & Sweets',
      categoryBn: 'বিজয়া দশমী ও মিষ্টি আপ্যায়ন',
      amount: 2300,
      timingDaysBefore: 0,
      notes: 'দশমীর মিষ্টি বিতরণ, শুভেচ্ছা বিনিময় ও পারিবারিক মিলনমেলা।',
    },
  ],
};

/**
 * Returns the customer's festival shock profile
 */
export function getCustomerUtsobProfile(
  customerId: string,
  festivalId: string = 'durga-puja-2026',
  isShieldActive: boolean = false,
  accumulatedInPocket: number = 0
): UtsobShieldProfile {
  const festival = FESTIVAL_CALENDAR.find((f) => f.id === festivalId) || FESTIVAL_CALENDAR[0];
  
  let customData = SYNTHETIC_CUSTOMER_FESTIVAL_SPENDING[customerId] || SYNTHETIC_CUSTOMER_FESTIVAL_SPENDING['C006'];

  // If Durga Puja is selected, use authentic Durga Puja breakdown
  if (festival.season === 'DURGA_PUJA') {
    customData = DURGA_PUJA_SPENDING;
  }

  const daysUntil = festival.daysAhead;
  const totalCost = customData.totalCost;
  const expectedBonus = customData.bonusAmount;

  // Daily micro amount to accumulate starting today
  const dailyPocketAmount = Math.ceil(totalCost / daysUntil / 10) * 10 || 210;
  const weeklyPocketAmount = dailyPocketAmount * 7;

  // Deficit calculation
  const deficitWithoutShield = Math.max(0, totalCost - (expectedBonus * 0.55));
  const deficitWithShield = isShieldActive ? 0 : deficitWithoutShield;

  return {
    festivalId: festival.id,
    festivalName: festival.name,
    festivalNameBn: festival.nameBn,
    daysUntilFestival: daysUntil,
    totalEstimatedCost: totalCost,
    expectedBonusAmount: expectedBonus,
    bonusArrivalDaysBefore: customData.bonusDaysBefore,
    spendingBreakdown: customData.breakdown,
    dailyPocketAmount,
    weeklyPocketAmount,
    deficitWithoutShield,
    deficitWithShield,
    shieldActive: isShieldActive,
    accumulatedInPocket,
  };
}

/**
 * Calculates a 90-day extended trajectory visualizing the festival valley
 * and demonstrates how the Utsob Shield completely flattens it!
 */
export function calculateUtsob90DayForecast(
  profile: CustomerFinancialProfile,
  isShieldActive: boolean,
  accumulatedPocketFloat: number = 0,
  festivalId: string = 'durga-puja-2026'
): {
  projections: UtsobProjectionPoint[];
  valleyLowestPoint: number;
  shieldLowestPoint: number;
  dailyPocketTarget: number;
  daysToFestival: number;
  totalFestivalShock: number;
  festivalName: string;
} {
  const currentBalance = profile.currentBalance;
  const dailySpend = profile.averageDailySpending;
  const daysUntilMonthlySalary = profile.daysUntilNextIncome;
  const monthlySalary = profile.monthlyIncome;

  const festival = FESTIVAL_CALENDAR.find((f) => f.id === festivalId) || FESTIVAL_CALENDAR[0];
  const isDurgaPuja = festival.season === 'DURGA_PUJA';

  const festivalData = isDurgaPuja
    ? DURGA_PUJA_SPENDING
    : (SYNTHETIC_CUSTOMER_FESTIVAL_SPENDING[profile.customerId] || SYNTHETIC_CUSTOMER_FESTIVAL_SPENDING['C006']);

  const totalShock = festivalData.totalCost;
  const bonusAmount = festivalData.bonusAmount;
  const daysToFestival = festival.daysAhead;

  const dailyPocketTarget = Math.ceil(totalShock / daysToFestival / 10) * 10 || 210;

  const projections: UtsobProjectionPoint[] = [];

  let unshieldedBalance = currentBalance;
  let shieldedBalance = currentBalance;
  let pocketFloat = accumulatedPocketFloat;

  let valleyLowest = currentBalance;
  let shieldLowest = currentBalance;

  // Base date (October 2026)
  const baseDate = new Date('2026-10-06T00:00:00Z');

  for (let day = 1; day <= 90; day++) {
    const projDate = new Date(baseDate.getTime() + day * 24 * 60 * 60 * 1000);
    const dateStr = projDate.toISOString().split('T')[0];
    const daysBeforeEvent = daysToFestival - day;

    // Routine daily spending
    let routineSpend = dailySpend;

    // Monthly regular salary cycles (Day 11, Day 41, Day 71)
    const isSalaryDay = (day % 30 === (daysUntilMonthlySalary % 30));
    const salaryCredit = isSalaryDay ? monthlySalary : 0;

    let festivalExpenseToday = 0;
    let eventFlag: string | undefined = undefined;

    if (isDurgaPuja) {
      // --- DURGA PUJA SHOCK SCHEDULE (Days 1 to 14 in Oct 2026) ---
      // 1. Puja shopping hits 7 days before Dashami (Day 7)
      if (daysBeforeEvent === 7) {
        festivalExpenseToday += 6500;
        eventFlag = '🛍️ দুর্গাপূজার নতুন পোশাক ও শপিং (-৭ দিন)';
      }
      // 2. Puja Chada / Anjali hits 4 days before Dashami (Day 10)
      if (daysBeforeEvent === 4) {
        festivalExpenseToday += 3400;
        eventFlag = '🪔 মণ্ডপ চাঁদা ও অঞ্জলি অনুদান (-৪ দিন)';
      }
      // 3. Puja bonus arrives 3 days before Dashami (Day 11)
      const bonusToday = (daysBeforeEvent === 3) ? bonusAmount : 0;
      if (daysBeforeEvent === 3) {
        eventFlag = '🎁 কোম্পানির উৎসব বোনাস ক্রেডিট (+৩ দিন)';
      }
      // 4. Mandap Hopping hits on Saptami-Navami (Day 12 & 13)
      if (daysBeforeEvent === 2 || daysBeforeEvent === 1) {
        festivalExpenseToday += (daysBeforeEvent === 2 ? 2000 : 1800);
        eventFlag = daysBeforeEvent === 2 ? '🛕 মহাসপ্তমী ও মণ্ডপ দর্শন' : '✨ মহানবমী ও সাংস্কৃতিক উৎসব';
      }
      // 5. Bijoya Dashami (Day 14)
      if (daysBeforeEvent === 0) {
        festivalExpenseToday += 2300;
        eventFlag = '🌺 শুভ বিজয়া দশমী ও মিষ্টিমুখ';
      }

      unshieldedBalance = unshieldedBalance - routineSpend - festivalExpenseToday + salaryCredit + ((daysBeforeEvent === 3) ? bonusAmount : 0);
    } else {
      // --- EID-UL-FITR SHOCK SCHEDULE (Day 66 to 88 in March 2027) ---
      if (daysBeforeEvent === 22) {
        festivalExpenseToday += 8500;
        eventFlag = '🛍️ ঈদের শপিং শুরু (-২২ দিন)';
      }
      if (daysBeforeEvent === 15) {
        festivalExpenseToday += 3200;
        eventFlag = '🚆 বাড়ি ফেরার অগ্রিম টিকিট (-১৫ দিন)';
      }
      if (daysBeforeEvent === 3) {
        festivalExpenseToday += 2000;
        eventFlag = '🍲 সেমাই ও পারিবারিক ভোজ (-৩ দিন)';
      }
      const bonusToday = (daysBeforeEvent === 4) ? bonusAmount : 0;
      if (daysBeforeEvent === 4) {
        eventFlag = '🎁 কোম্পানির ঈদ বোনাস ক্রেডিট (+৪ দিন)';
      }
      if (daysBeforeEvent === 1 || daysBeforeEvent === 0) {
        festivalExpenseToday += (daysBeforeEvent === 1 ? 2000 : 2300);
        eventFlag = daysBeforeEvent === 0 ? '🌙 পবিত্র ঈদুল ফিতর ও সালামি' : '✨ চাঁদ রাত ও সালামি বিতরণ';
      }

      unshieldedBalance = unshieldedBalance - routineSpend - festivalExpenseToday + salaryCredit + bonusToday;
    }

    // --- SHIELDED TRAJECTORY (Utsob Shield Active) ---
    if (isShieldActive) {
      const dailyPocketDeposit = dailyPocketTarget;
      pocketFloat += dailyPocketDeposit;

      let paidFromPocket = 0;
      if (festivalExpenseToday > 0) {
        paidFromPocket = Math.min(pocketFloat, festivalExpenseToday);
        pocketFloat -= paidFromPocket;
      }

      const remainderOutOfPocket = festivalExpenseToday - paidFromPocket;
      const bonusOnThisDay = isDurgaPuja ? ((daysBeforeEvent === 3) ? bonusAmount : 0) : ((daysBeforeEvent === 4) ? bonusAmount : 0);
      shieldedBalance = shieldedBalance - routineSpend - dailyPocketDeposit - remainderOutOfPocket + salaryCredit + bonusOnThisDay;
    } else {
      shieldedBalance = unshieldedBalance;
    }

    const isValleyZone = isDurgaPuja
      ? (daysBeforeEvent <= 8 && daysBeforeEvent >= -1 && unshieldedBalance < 1500)
      : (daysBeforeEvent <= 25 && daysBeforeEvent >= -3 && unshieldedBalance < 1500);

    if (unshieldedBalance < valleyLowest) {
      valleyLowest = unshieldedBalance;
    }
    if (shieldedBalance < shieldLowest) {
      shieldLowest = shieldedBalance;
    }

    projections.push({
      dayOffset: day,
      date: dateStr,
      dayLabel: `Day +${day}`,
      unshieldedBalance: Math.round(unshieldedBalance),
      shieldedBalance: Math.round(shieldedBalance),
      pocketAccumulation: Math.round(pocketFloat),
      eventFlag,
      isEidValley: isValleyZone,
    });
  }

  return {
    projections,
    valleyLowestPoint: valleyLowest,
    shieldLowestPoint: shieldLowest,
    dailyPocketTarget,
    daysToFestival,
    totalFestivalShock: totalShock,
    festivalName: festival.nameBn,
  };
}

/**
 * Qurbani Share Planner configuration & state
 */
export function getDefaultQurbaniPlan(): QurbaniSharePlan {
  return {
    shareType: 'ONE_SEVENTH_COW',
    shareTypeBn: '১/৭ গরুর অংশীদারিত্ব (১ অংশ)',
    animalCost: 22000,
    hasilAndTransportFee: 1800,
    butcherAndProcessingFee: 2200,
    totalTarget: 26000,
    currentSaved: 4200,
    weeksRemaining: 22, // ~155 days
    weeklyTarget: 990,
    dailyTarget: 140,
    participants: [
      { name: 'ফারহান কবির (আপনি)', shareRatio: 1, paid: 4200 },
      { name: 'কবিরুল ইসলাম (বড় ভাই)', shareRatio: 1, paid: 4000 },
      { name: 'তারিক হাসান (চাচাতো ভাই)', shareRatio: 1, paid: 2500 },
      { name: 'আরিফ জামান (সহকর্মী)', shareRatio: 1, paid: 3000 },
      { name: 'মাহবুব আলম (বন্ধু)', shareRatio: 1, paid: 3500 },
      { name: 'খোরশেদ আহমেদ (প্রতিবেশী)', shareRatio: 1, paid: 2000 },
      { name: 'জাহিদুল ইসলাম', shareRatio: 1, paid: 1500 },
    ],
    qrMerchantReady: true,
  };
}
