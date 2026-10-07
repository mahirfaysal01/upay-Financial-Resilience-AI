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
        category: 'Eid Shopping',
        categoryBn: 'পোশাক ও কেনাকাটা',
        amount: 6500,
        timingDaysBefore: 20,
        notes: 'পরিবার ও নিজের জন্য পোশাক।',
      },
      {
        category: 'Travel Home',
        categoryBn: 'বাড়ি ফেরার যাতায়াত খরচ',
        amount: 2500,
        timingDaysBefore: 12,
        notes: 'বাসের টিকিট ও ভ্রমণ।',
      },
      {
        category: 'Salami',
        categoryBn: 'সালামি ও দান-সদকা',
        amount: 3200,
        timingDaysBefore: 1,
        notes: 'ঈদের সালামি।',
      },
      {
        category: 'Feast',
        categoryBn: 'পারিবারিক খাবার',
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
        category: 'Eid Shopping',
        categoryBn: 'পোশাক ও উপহার',
        amount: 7000,
        timingDaysBefore: 18,
        notes: 'অগ্রিম উপহার সামগ্রী।',
      },
      {
        category: 'Travel Home',
        categoryBn: 'পরিবারের সাথে ভ্রমণ',
        amount: 3000,
        timingDaysBefore: 10,
        notes: 'যাতায়াত।',
      },
      {
        category: 'Salami',
        categoryBn: 'সালামি ও মিষ্টিমুখ',
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
 * Returns the customer's festival shock profile
 */
export function getCustomerUtsobProfile(
  customerId: string,
  festivalId: string = 'eid-ul-fitr-2027',
  isShieldActive: boolean = false,
  accumulatedInPocket: number = 0
): UtsobShieldProfile {
  const festival = FESTIVAL_CALENDAR.find((f) => f.id === festivalId) || FESTIVAL_CALENDAR[0];
  const customData = SYNTHETIC_CUSTOMER_FESTIVAL_SPENDING[customerId] || SYNTHETIC_CUSTOMER_FESTIVAL_SPENDING['C006'];

  const daysUntil = festival.daysAhead;
  const totalCost = customData.totalCost;
  const expectedBonus = customData.bonusAmount;

  // Daily micro amount to accumulate starting today
  // e.g. 18,000 / 88 days ≈ ৳205 - ৳210
  const dailyPocketAmount = Math.ceil(totalCost / daysUntil / 10) * 10 || 210;
  const weeklyPocketAmount = dailyPocketAmount * 7;

  // Deficit calculation:
  // Without shield: before bonus arrives on Day -4, user has spent 8,500 + 3,200 = 11,700 on credit.
  // After Eid, they pay credit bills + interest and start next month with deep negative.
  const deficitWithoutShield = Math.max(0, totalCost - (expectedBonus * 0.55)); // Typical month-end deficit
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
 * Calculates a 90-day extended trajectory visualizing the deep red "Eid Valley"
 * and demonstrates how the Utsob Shield completely flattens it!
 */
export function calculateUtsob90DayForecast(
  profile: CustomerFinancialProfile,
  isShieldActive: boolean,
  accumulatedPocketFloat: number = 0
): {
  projections: UtsobProjectionPoint[];
  valleyLowestPoint: number;
  shieldLowestPoint: number;
  dailyPocketTarget: number;
  daysToEid: number;
  totalFestivalShock: number;
} {
  const currentBalance = profile.currentBalance;
  const dailySpend = profile.averageDailySpending;
  const daysUntilMonthlySalary = profile.daysUntilNextIncome;
  const monthlySalary = profile.monthlyIncome;

  const festivalData = SYNTHETIC_CUSTOMER_FESTIVAL_SPENDING[profile.customerId] || SYNTHETIC_CUSTOMER_FESTIVAL_SPENDING['C006'];
  const totalShock = festivalData.totalCost;
  const bonusAmount = festivalData.bonusAmount;
  const daysToEid = 88; // Eid Day offset

  const dailyPocketTarget = Math.ceil(totalShock / daysToEid / 10) * 10 || 210;

  const projections: UtsobProjectionPoint[] = [];

  let unshieldedBalance = currentBalance;
  let shieldedBalance = currentBalance;
  let pocketFloat = accumulatedPocketFloat;

  let valleyLowest = currentBalance;
  let shieldLowest = currentBalance;

  // Today base date
  const baseDate = new Date('2026-10-06T00:00:00Z');

  for (let day = 1; day <= 90; day++) {
    const projDate = new Date(baseDate.getTime() + day * 24 * 60 * 60 * 1000);
    const dateStr = projDate.toISOString().split('T')[0];
    const daysBeforeEid = daysToEid - day;

    // Routine spending
    let routineSpend = dailySpend;

    // Monthly regular salary cycles (Day 11, Day 41, Day 71)
    const isSalaryDay = (day % 30 === (daysUntilMonthlySalary % 30));
    const salaryCredit = isSalaryDay ? monthlySalary : 0;

    // Festival Shock schedule (when unshielded expenses hit):
    let festivalExpenseToday = 0;
    let eventFlag: string | undefined = undefined;

    // 1. Eid Shopping hits ~22 days before Eid (Day 66)
    if (daysBeforeEid === 22) {
      festivalExpenseToday += 8500;
      eventFlag = '🛍️ ঈদের শপিং শুরু (-২২ দিন)';
    }

    // 2. Train/Bus ticket booking hits ~15 days before Eid (Day 73)
    if (daysBeforeEid === 15) {
      festivalExpenseToday += 3200;
      eventFlag = '🚆 বাড়ি ফেরার অগ্রিম টিকিট (-১৫ দিন)';
    }

    // 3. Feast groceries hit ~3 days before Eid (Day 85)
    if (daysBeforeEid === 3) {
      festivalExpenseToday += 2000;
      eventFlag = '🍲 সেমাই ও পারিবারিক ভোজ (-৩ দিন)';
    }

    // 4. Festival Bonus arrives 4 days before Eid (Day 84)
    const bonusToday = (daysBeforeEid === 4) ? bonusAmount : 0;
    if (daysBeforeEid === 4) {
      eventFlag = '🎁 কোম্পানির ঈদ বোনাস ক্রেডিট (+৪ দিন)';
    }

    // 5. Salami hits on Eid Eve & Day (Day 87 & 88)
    if (daysBeforeEid === 1 || daysBeforeEid === 0) {
      festivalExpenseToday += (daysBeforeEid === 1 ? 2000 : 2300);
      eventFlag = daysBeforeEid === 0 ? '🌙 পবিত্র ঈদুল ফিতর ও সালামি' : '✨ চাঁদ রাত ও সালামি বিতরণ';
    }

    // --- UNSHIELDED TRAJECTORY ---
    // User doesn't set aside money. When shopping/tickets hit in Day 66-73, balance plunges deep into negative
    unshieldedBalance = unshieldedBalance - routineSpend - festivalExpenseToday + salaryCredit + bonusToday;

    // --- SHIELDED TRAJECTORY (Utsob Shield Active) ---
    if (isShieldActive) {
      // User sets aside dailyPocketTarget (৳210) into protected Utsob Pocket
      const dailyPocketDeposit = dailyPocketTarget;
      pocketFloat += dailyPocketDeposit;

      // When festival expenses hit, they are paid directly from the Utsob Pocket!
      let paidFromPocket = 0;
      if (festivalExpenseToday > 0) {
        paidFromPocket = Math.min(pocketFloat, festivalExpenseToday);
        pocketFloat -= paidFromPocket;
      }

      const remainderOutOfPocket = festivalExpenseToday - paidFromPocket;
      // Main wallet pays only normal burn + daily pocket deposit + any remainder
      shieldedBalance = shieldedBalance - routineSpend - dailyPocketDeposit - remainderOutOfPocket + salaryCredit + bonusToday;
    } else {
      shieldedBalance = unshieldedBalance;
    }

    // Is it in the deep red "Eid Valley" zone? (Days 65 to 87 before bonus compensates)
    const isValleyZone = daysBeforeEid <= 25 && daysBeforeEid >= -3 && unshieldedBalance < 1500;

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
    daysToEid,
    totalFestivalShock: totalShock,
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
