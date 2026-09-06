export interface StandardEstimate {
  code: string;
  duration: string;
  testingCost: string;
  applicationFee: string;
  disclaimer: string;
}

const ESTIMATES_DATABASE: Record<string, StandardEstimate> = {
  'IS 302-2-201': {
    code: 'IS 302-2-201',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹25,000 - ₹45,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 16242': {
    code: 'IS 16242',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹30,000 - ₹50,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 302 (series)': {
    code: 'IS 302 (series)',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹25,000 - ₹60,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 616': {
    code: 'IS 616',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹35,000 - ₹55,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 1293': {
    code: 'IS 1293',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹20,000 - ₹40,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 16102 (Part 1 & 2)': {
    code: 'IS 16102 (Part 1 & 2)',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹18,000 - ₹35,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 16103': {
    code: 'IS 16103',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹20,000 - ₹38,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 15885': {
    code: 'IS 15885',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹22,000 - ₹40,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 10322:2026 (series)': {
    code: 'IS 10322:2026 (series)',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹25,000 - ₹45,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS/IEC 62368-1:2023': {
    code: 'IS/IEC 62368-1:2023',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹30,000 - ₹60,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 4151': {
    code: 'IS 4151',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹40,000 - ₹75,000 approx',
    applicationFee: '₹1,000 application + ₹7,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 269': {
    code: 'IS 269',
    duration: '10 - 14 weeks (ISI Mark Scheme I)',
    testingCost: '₹45,000 - ₹85,000 approx',
    applicationFee: '₹1,000 application + ₹10,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 1786': {
    code: 'IS 1786',
    duration: '10 - 14 weeks (ISI Mark Scheme I)',
    testingCost: '₹50,000 - ₹90,000 approx',
    applicationFee: '₹1,000 application + ₹10,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 9873 (series)': {
    code: 'IS 9873 (series)',
    duration: '6 - 10 weeks (ISI Mark Scheme I)',
    testingCost: '₹20,000 - ₹50,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 14543': {
    code: 'IS 14543',
    duration: '10 - 14 weeks (ISI Mark Scheme I)',
    testingCost: '₹50,000 - ₹90,000 (chemical/microbiological testing)',
    applicationFee: '₹1,000 application + ₹15,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 15683': {
    code: 'IS 15683',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹35,000 - ₹65,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 16046 (Part 1 & 2)': {
    code: 'IS 16046 (Part 1 & 2)',
    duration: '4 - 6 weeks (CRS Scheme II)',
    testingCost: '₹35,000 - ₹65,000 approx',
    applicationFee: '₹1,000 application + ₹5,000 registration fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
  'IS 1077': {
    code: 'IS 1077',
    duration: '8 - 12 weeks (ISI Mark Scheme I)',
    testingCost: '₹15,000 - ₹30,000 approx',
    applicationFee: '₹1,000 application + ₹3,000 marking fee approx',
    disclaimer: 'Estimated figures based on public BIS fee schedules & NABL lab averages. Confirm exact quote with BIS / lab.',
  },
};

export function getEstimatesForStandard(codeOrQuery?: string): StandardEstimate {
  if (!codeOrQuery) {
    return {
      code: 'Unknown',
      duration: 'Contact BIS for current fee schedule',
      testingCost: 'Contact BIS for current fee schedule',
      applicationFee: 'Contact BIS for current fee schedule',
      disclaimer: 'Approximate estimate. Confirm exact figures with official BIS channels.',
    };
  }

  const queryClean = codeOrQuery.toLowerCase().trim();

  for (const [code, est] of Object.entries(ESTIMATES_DATABASE)) {
    if (
      queryClean.includes(code.toLowerCase()) ||
      code.toLowerCase().includes(queryClean) ||
      (code.includes('302') && queryClean.includes('302')) ||
      (code.includes('16102') && queryClean.includes('16102')) ||
      (code.includes('16046') && queryClean.includes('16046')) ||
      (code.includes('9873') && queryClean.includes('9873')) ||
      (code.includes('10322') && queryClean.includes('10322'))
    ) {
      return est;
    }
  }

  if (queryClean.includes('crs') || queryClean.includes('compulsory registration')) {
    return {
      code: 'CRS General Category',
      duration: '4 - 6 weeks approx',
      testingCost: '₹20,000 - ₹45,000 approx',
      applicationFee: '₹1,000 application fee + ₹5,000 registration fee',
      disclaimer: 'General CRS scheme estimate. Confirm exact figures with BIS / NABL testing lab.',
    };
  }

  if (queryClean.includes('isi') || queryClean.includes('scheme i')) {
    return {
      code: 'ISI Mark General Category',
      duration: '8 - 12 weeks approx (domestic audit)',
      testingCost: '₹30,000 - ₹65,000 approx',
      applicationFee: '₹1,000 application fee + marking fee',
      disclaimer: 'General ISI scheme estimate. Confirm exact figures with BIS / NABL testing lab.',
    };
  }

  return {
    code: codeOrQuery,
    duration: 'Contact BIS for current fee schedule',
    testingCost: 'Contact BIS for current fee schedule',
    applicationFee: 'Contact BIS for current fee schedule',
    disclaimer: 'Approximate estimate. Confirm exact figures with official BIS channels.',
  };
}
