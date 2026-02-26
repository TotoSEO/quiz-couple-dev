
interface TranslationConfig {
  gdPrefix: string;
  questionFormat: 'numbered' | 'q-prefixed';
  optionFormat: 'none' | 'lowercase' | 'uppercase' | 'indexed' | 'letterIndexed';
}

export const QUIZ_I18N: Record<string, TranslationConfig> = {
  most: { gdPrefix: 'most', questionFormat: 'numbered', optionFormat: 'none' },
  knowledge: { gdPrefix: 'knowledge', questionFormat: 'numbered', optionFormat: 'none' },
  funny: { gdPrefix: 'funny', questionFormat: 'numbered', optionFormat: 'none' },
  debate: { gdPrefix: 'debate', questionFormat: 'q-prefixed', optionFormat: 'none' },
  toxic: { gdPrefix: 'toxic', questionFormat: 'q-prefixed', optionFormat: 'lowercase' },
  distance: { gdPrefix: 'distance', questionFormat: 'q-prefixed', optionFormat: 'lowercase' },
  healthy: { gdPrefix: 'healthy', questionFormat: 'q-prefixed', optionFormat: 'lowercase' },
  coquin: { gdPrefix: 'coquinQ', questionFormat: 'q-prefixed', optionFormat: 'uppercase' },
  testerC: { gdPrefix: 'testerC', questionFormat: 'q-prefixed', optionFormat: 'indexed' },
  cp: { gdPrefix: 'cp', questionFormat: 'q-prefixed', optionFormat: 'none' },
  marriage: { gdPrefix: 'marriage', questionFormat: 'q-prefixed', optionFormat: 'letterIndexed' },
  divorce: { gdPrefix: 'divorce', questionFormat: 'q-prefixed', optionFormat: 'lowercase' },
};

interface QuizJsonLdProps {
  id: string;
  title: string;
  description: string;
  category?: string;
  subcategory?: string;
  totalQuestions: number;
  questions: any[];
  results?: any[];
  version?: string;
  timeRequired?: number; // in seconds
  lang: string;
  createdDate?: string; // ISO date string
  t?: (key: string, options?: any) => string;
  translationConfig?: TranslationConfig;
}

export const generateQuizJsonLd = ({
  id,
  title,
  description,
  category = "couple",
  subcategory,
  totalQuestions,
  questions,
  results = [],
  version = "1.0",
  timeRequired = 300,
  lang,
  createdDate = "2026-01-23",
  t,
  translationConfig,
}: QuizJsonLdProps) => {

  // Check if a translation result is a real translation (not a raw key)
  const isValidTranslation = (translated: string, key: string) => {
    if (translated === key) return false;
    // i18next strips namespace, so "gd:healthy.q1" becomes "healthy.q1"
    const keyWithoutNs = key.includes(':') ? key.split(':').slice(1).join(':') : key;
    if (translated === keyWithoutNs) return false;
    // If it looks like a dot-separated key with no spaces, it's not translated
    if (/^[a-zA-Z0-9_.]+$/.test(translated)) return false;
    return true;
  };

  const getQuestionText = (q: any) => {
    if (t && translationConfig && lang !== 'fr') {
      const { gdPrefix, questionFormat } = translationConfig;
      const key = questionFormat === 'numbered'
        ? `gd:${gdPrefix}.${q.id}`
        : `gd:${gdPrefix}.q${q.id}`;
      const translated = t(key);
      if (isValidTranslation(translated, key)) return translated;
    }
    return q.text || q.question || "";
  };

  const getOptionText = (q: any, opt: any, optIndex: number) => {
    if (t && translationConfig && translationConfig.optionFormat !== 'none' && lang !== 'fr') {
      const { gdPrefix, optionFormat } = translationConfig;
      let key = '';
      if (optionFormat === 'lowercase') {
        key = `gd:${gdPrefix}.q${q.id}${opt.id.toLowerCase()}`;
      } else if (optionFormat === 'uppercase') {
        key = `gd:${gdPrefix}.q${q.id}${opt.id}`;
      } else if (optionFormat === 'indexed') {
        key = `gd:${gdPrefix}.q${q.id}o${optIndex}`;
      } else if (optionFormat === 'letterIndexed') {
        const letters = ['a', 'b', 'c', 'd', 'e'];
        key = `gd:${gdPrefix}.q${q.id}${letters[optIndex] || optIndex}`;
      }
      const translated = t(key);
      if (isValidTranslation(translated, key)) return translated;
    }
    return opt.text || opt.label || "";
  };

  const mappedQuestions = questions.slice(0, totalQuestions).map((q, index) => {
    const questionObj: any = {
      "@type": "Question",
      "position": index + 1,
      "name": getQuestionText(q),
    };

    if (q.options && q.options.length > 0) {
      questionObj.suggestedAnswer = q.options.map((opt: any, oi: number) => ({
        "@type": "Answer",
        "position": oi + 1,
        "text": getOptionText(q, opt, oi),
      }));
    }

    return questionObj;
  });

  const mappedResults = results.map((r: any) => ({
    "@type": "Thing",
    "name": r.title || r.label || "Result",
    "description": r.description || "",
  }));

  const maxScore = questions.slice(0, totalQuestions).reduce((acc, q) => {
    const maxOpt = Math.max(...(q.options?.map((o: any) => o.points || o.score || 0) || [0]));
    return acc + maxOpt;
  }, 0) || totalQuestions;

  const timeMinutes = Math.round(timeRequired / 60);
  const players = title.toLowerCase().includes('duo') || title.toLowerCase().includes('deux') || title.toLowerCase().includes('two') ? 2 : 1;

  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": title,
    "description": description,
    "inLanguage": lang,
    "dateCreated": createdDate,
    "datePublished": createdDate,
    "timeRequired": `PT${timeMinutes}M`,
    "learningResourceType": "Quiz",
    "interactivityType": "active",
    "isAccessibleForFree": true,
    "educationalAlignment": {
      "@type": "AlignmentObject",
      "educationalFramework": "Couple intimacy",
      "targetName": "Communication & connaissance de l'autre",
      "alignmentType": "teaches",
    },
    "about": {
      "@type": "Thing",
      "name": category,
    },
    "hasPart": mappedQuestions,
    
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "totalQuestions", "value": totalQuestions },
      { "@type": "PropertyValue", "name": "maxScore", "value": maxScore },
      { "@type": "PropertyValue", "name": "version", "value": version },
      { "@type": "PropertyValue", "name": "subcategory", "value": subcategory || id },
      { "@type": "PropertyValue", "name": "difficulty", "value": "easy" },
      { "@type": "PropertyValue", "name": "audience", "value": "couples" },
      { "@type": "PropertyValue", "name": "players", "value": players },
    ],
  };
};
