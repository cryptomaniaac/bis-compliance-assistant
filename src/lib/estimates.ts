export interface StandardEstimate {
  code: string;
  duration: string;
  testingCost: string;
  applicationFee: string;
  sourceNote: string;
  disclaimer: string;
  hasVerifiedData: boolean;
}

const ESTIMATES_DATABASE: Record<string, StandardEstimate> = {
  'IS 302-2-201': {
    code: 'IS 302-2-201',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹25,000 - ₹45,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    sourceNote: 'Source: BIS Product Certification Scheme-I Fee Schedule (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS 16242': {
    code: 'IS 16242',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹30,000 - ₹50,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    sourceNote: 'Source: BIS Product Certification Scheme-I Fee Schedule (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS 16102 (Part 1 & 2)': {
    code: 'IS 16102 (Part 1 & 2)',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹18,000 - ₹35,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    sourceNote: 'Source: BIS Compulsory Registration Scheme (CRS) Circular (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS 16103': {
    code: 'IS 16103',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹20,000 - ₹38,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    sourceNote: 'Source: BIS Compulsory Registration Scheme (CRS) Circular (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS 15885': {
    code: 'IS 15885',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹22,000 - ₹40,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    sourceNote: 'Source: BIS Compulsory Registration Scheme (CRS) Circular (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS 10322:2026 (series)': {
    code: 'IS 10322:2026 (series)',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹25,000 - ₹45,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    sourceNote: 'Source: BIS Compulsory Registration Scheme (CRS) Circular (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS/IEC 62368-1:2023': {
    code: 'IS/IEC 62368-1:2023',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹30,000 - ₹60,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    sourceNote: 'Source: BIS Compulsory Registration Scheme (CRS) Circular (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS 4151': {
    code: 'IS 4151',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹40,000 - ₹75,000 approx',
    applicationFee: '₹1,000 application + ₹7,000 marking fee approx',
    sourceNote: 'Source: BIS Product Certification Scheme-I Schedule (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS 9873 (series)': {
    code: 'IS 9873 (series)',
    duration: '6 - 10 weeks (ISI Mark Scheme I)',
    testingCost: '₹20,000 - ₹50,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    sourceNote: 'Source: BIS Product Certification Scheme-I Schedule & Toys QCO (2025)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS 14543': {
    code: 'IS 14543',
    duration: '10 - 14 weeks (ISI Mark Scheme I)',
    testingCost: '₹50,000 - ₹90,000 (chemical/microbiological testing)',
    applicationFee: '₹1,000 application + ₹15,000 marking fee approx',
    sourceNote: 'Source: BIS Product Certification Scheme-I Schedule (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
  'IS 16046 (Part 1 & 2)': {
    code: 'IS 16046 (Part 1 & 2)',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹35,000 - ₹65,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    sourceNote: 'Source: BIS Compulsory Registration Scheme (CRS) Circular (2025/2026)',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: true,
  },
};

export function getEstimatesForStandard(codeOrQuery?: string): StandardEstimate {
  if (!codeOrQuery) {
    return {
      code: 'Unknown',
      duration: 'Contact BIS / a NABL lab for current pricing',
      testingCost: 'Contact BIS / a NABL lab for current pricing',
      applicationFee: 'Contact BIS / a NABL lab for current pricing',
      sourceNote: 'Official quote required from BIS or accredited testing lab',
      disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
      hasVerifiedData: false,
    };
  }

  const queryClean = codeOrQuery.toLowerCase().trim();

  for (const [code, est] of Object.entries(ESTIMATES_DATABASE)) {
    if (
      queryClean.includes(code.toLowerCase()) ||
      code.toLowerCase().includes(queryClean) ||
      (code.includes('302-2-201') && queryClean.includes('201')) ||
      (code.includes('16102') && queryClean.includes('16102')) ||
      (code.includes('16046') && queryClean.includes('16046')) ||
      (code.includes('9873') && queryClean.includes('9873')) ||
      (code.includes('10322') && queryClean.includes('10322')) ||
      (code.includes('14543') && queryClean.includes('14543')) ||
      (code.includes('4151') && queryClean.includes('4151'))
    ) {
      return est;
    }
  }

  // Fallback for unverified codes
  return {
    code: codeOrQuery,
    duration: 'Contact BIS / a NABL lab for current pricing',
    testingCost: 'Contact BIS / a NABL lab for current pricing',
    applicationFee: 'Contact BIS / a NABL lab for current pricing',
    sourceNote: 'Official quote required from BIS or accredited testing lab',
    disclaimer: 'Approximate estimate only — confirm exact figures with BIS or your testing lab.',
    hasVerifiedData: false,
  };
}
