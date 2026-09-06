import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, buildUserPrompt, LANGUAGE_NAMES } from './prompt';
import { RetrievalResult } from './retrieval';

export interface LabelCheckItem {
  item: string;
  status: 'pass' | 'fail' | 'uncertain';
  detail: string;
}

export interface StructuredBISResponse {
  responseType?: 'compliance_report' | 'conversational' | 'label_analysis' | 'non_bis_regulated';
  identified_product?: string;
  summary: string;
  applicable_standards: Array<{
    code: string;
    title: string;
    why: string;
  }>;
  certification_required: string;
  testing_requirements: string[];
  action_checklist: Array<{
    step: number;
    action: string;
    detail: string;
  }>;
  label_checklist?: LabelCheckItem[];
  follow_up_questions?: string[];
  sources: string[];
  found_in_context: boolean;
}

export interface TranslationResult {
  isAmbiguous: boolean;
  clarifyingQuestion?: string;
  englishQuery: string;
}

/**
 * Translates non-English user input into English for vector retrieval,
 * or detects if the query is ambiguous and needs clarification in the target language.
 */
export async function translateInputAndCheckAmbiguity(
  userQuery: string,
  targetLanguage: string
): Promise<TranslationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !targetLanguage || targetLanguage === 'en') {
    return { isAmbiguous: false, englishQuery: userQuery };
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
    });

    const langName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    const prompt = `You are a multilingual query analyzer for an Indian Standards (BIS) compliance assistant.
The user provided an input in ${langName} (${targetLanguage}): "${userQuery}".

Tasks:
1. Determine if the input is deliberately vague, incomplete, or ambiguous regarding what product or compliance issue the user wants to address (e.g. "मुझे सामान बेचना है", "license details", "सामान का क्या करें").
2. If ambiguous: set "isAmbiguous": true, write a helpful clarifying question directly in ${langName} asking for product details in "clarifyingQuestion", and set "englishQuery": "${userQuery}".
3. If clear or a normal product query or greeting: set "isAmbiguous": false, and translate the core intent/product query into English in "englishQuery".

Respond strictly with valid JSON:
{
  "isAmbiguous": boolean,
  "clarifyingQuestion": string,
  "englishQuery": string
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      isAmbiguous: Boolean(parsed.isAmbiguous),
      clarifyingQuestion: parsed.clarifyingQuestion || undefined,
      englishQuery: parsed.englishQuery || userQuery
    };
  } catch (err) {
    console.error('Translation & Ambiguity check error:', err);
    return { isAmbiguous: false, englishQuery: userQuery };
  }
}

export async function generateComplianceResponse(
  userQuery: string,
  retrievedContext: RetrievalResult,
  history: { role: string; content: string }[] = [],
  targetLanguage: string = 'en'
): Promise<StructuredBISResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY missing. Generating deterministic grounded fallback response.');
    return generateDeterministicFallback(userQuery, retrievedContext, targetLanguage);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const prompt = buildUserPrompt(userQuery, retrievedContext, history, targetLanguage);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text) as StructuredBISResponse;
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError, 'Raw text:', text);
      return generateDeterministicFallback(userQuery, retrievedContext, targetLanguage);
    }
  } catch (err) {
    console.error('Gemini API call failed:', err);
    return generateDeterministicFallback(userQuery, retrievedContext, targetLanguage);
  }
}

function generateDeterministicFallback(
  userQuery: string,
  retrievedContext: RetrievalResult,
  targetLanguage: string = 'en'
): StructuredBISResponse {
  const standards = retrievedContext.standards.map(st => ({
    code: st.standard_code,
    title: st.title,
    why: `Directly applicable standard for ${st.product_category} under BIS guidelines.`
  }));

  const isCRS = retrievedContext.standards.some(s => s.certification_type?.toLowerCase().includes('crs'));

  // Simple heuristic for fallback classification
  const conversationalPatterns = /^(hi+|hello+|hey+|good\s+(morning|afternoon|evening|night)|how are you|how's it going|what's up|thanks|thank you|thank you so much|appreciate it|great|awesome|ok|okay|bye+|goodbye|see you|that'?s all|take care)[!?.]*$/i;
  const isConversational = conversationalPatterns.test(userQuery.trim());

  const isNonEnglish = targetLanguage && targetLanguage !== 'en';
  const langNote = isNonEnglish ? ' (Note: Displayed in English due to temporary language processing fallback.)' : '';

  if (isConversational) {
    return {
      responseType: 'conversational',
      summary: `Hi there! I'm Bharat, your BIS compliance consultant. How can I assist you with product certification today?${langNote}`,
      applicable_standards: [],
      certification_required: '',
      testing_requirements: [],
      action_checklist: [],
      follow_up_questions: ["What product are you looking to certify under BIS guidelines?"],
      sources: [],
      found_in_context: false
    };
  }

  return {
    responseType: 'compliance_report',
    identified_product: userQuery.slice(0, 40),
    summary: `Based on your query regarding "${userQuery}", here is the official regulatory compliance breakdown under Indian Standards.${langNote}`,
    applicable_standards: standards,
    certification_required: isCRS
      ? 'CRS — Compulsory Registration Scheme (Scheme II)'
      : 'ISI Mark — Product Certification Scheme (Scheme I)',
    testing_requirements: retrievedContext.standards[0]?.testing_requirements
      ? [retrievedContext.standards[0].testing_requirements]
      : ['Product safety and quality conformity testing at NABL accredited laboratory'],
    action_checklist: [
      { step: 1, action: 'Product Categorization', detail: 'Verify IS Code and certification route (CRS vs ISI Mark)' },
      { step: 2, action: 'Lab Testing', detail: 'Submit samples to BIS recognized NABL accredited lab' },
      { step: 3, action: 'Online Application', detail: 'File application on Manakonline / CRS Portal' },
      { step: 4, action: 'Grant of License', detail: 'Affix Standard Mark with unique R-number / CML number' }
    ],
    follow_up_questions: [
      'Are you manufacturing this product in India or importing from abroad?',
      'Do you need specific testing requirements or factory audit guidance?'
    ],
    sources: ['https://www.bis.gov.in', 'https://manakonline.bis.gov.in'],
    found_in_context: retrievedContext.standards.length > 0
  };
}
