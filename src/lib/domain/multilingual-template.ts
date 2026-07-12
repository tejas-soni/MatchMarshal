import type { IncidentCategory, SupportedLanguage } from '../types';

/**
 * Multilingual emergency/communication phrases for each incident category.
 * Keyed by category → language → phrase.
 *
 * Phrases are short, spoken-word templates a volunteer can read aloud to a fan.
 * They convey the core message without requiring the volunteer to speak the language fluently.
 */
const PHRASE_BANK: Record<IncidentCategory, Record<SupportedLanguage, string>> = {
  'medical': {
    en: 'Please stay calm. Medical help is on the way. Do not move.',
    es: 'Por favor, mantenga la calma. La ayuda médica está en camino. No se mueva.',
    fr: 'Restez calme. Les secours médicaux arrivent. Ne bougez pas.',
    ar: 'يرجى البقاء هادئًا. المساعدة الطبية في الطريق. لا تتحرك.',
    pt: 'Por favor, fique calmo. O socorro médico está a caminho. Não se mova.',
    hi: 'कृपया शांत रहें। चिकित्सा सहायता रास्ते में है। हिलें नहीं।',
  },
  'lost-child': {
    en: 'Please don\'t worry. We will help find your child. Stay with us.',
    es: 'No se preocupe. Le ayudaremos a encontrar a su hijo. Quédese con nosotros.',
    fr: 'Ne vous inquiétez pas. Nous allons vous aider à retrouver votre enfant. Restez avec nous.',
    ar: 'لا تقلق. سنساعدك في العثور على طفلك. ابق معنا.',
    pt: 'Não se preocupe. Vamos ajudá-lo a encontrar seu filho. Fique conosco.',
    hi: 'चिंता मत करो। हम आपके बच्चे को ढूंढने में मदद करेंगे। हमारे साथ रहें।',
  },
  'aggressive-fan': {
    en: 'Please move away from this area for your safety. Security is coming.',
    es: 'Por favor, aléjese de esta área por su seguridad. La seguridad está en camino.',
    fr: 'Veuillez vous éloigner de cette zone pour votre sécurité. La sécurité arrive.',
    ar: 'يرجى الابتعاد عن هذه المنطقة لسلامتك. الأمن في الطريق.',
    pt: 'Por favor, afaste-se desta área pela sua segurança. A segurança está a caminho.',
    hi: 'कृपया अपनी सुरक्षा के लिए इस क्षेत्र से दूर चले जाएं। सुरक्षा आ रही है।',
  },
  'crowd-buildup': {
    en: 'Please use the alternative entrance to the left. This area is congested.',
    es: 'Por favor, use la entrada alternativa a la izquierda. Esta área está congestionada.',
    fr: 'Veuillez utiliser l\'entrée alternative à gauche. Cette zone est encombrée.',
    ar: 'يرجى استخدام المدخل البديل على اليسار. هذه المنطقة مزدحمة.',
    pt: 'Por favor, use a entrada alternativa à esquerda. Esta área está congestionada.',
    hi: 'कृपया बाईं ओर वैकल्पिक प्रवेश द्वार का उपयोग करें। यह क्षेत्र भीड़भाड़ है।',
  },
  'accessibility': {
    en: 'How can I help you today? I am here to assist you.',
    es: '¿Cómo puedo ayudarle hoy? Estoy aquí para asistirle.',
    fr: 'Comment puis-je vous aider aujourd\'hui ? Je suis là pour vous assister.',
    ar: 'كيف يمكنني مساعدتك اليوم؟ أنا هنا لمساعدتك.',
    pt: 'Como posso ajudá-lo hoje? Estou aqui para assistir.',
    hi: 'मैं आज आपकी कैसे मदद कर सकता हूं? मैं यहाँ आपकी सहायता के लिए हूं।',
  },
  'weather': {
    en: 'Please move to a covered area immediately for your safety.',
    es: 'Por favor, muévase a una zona cubierta de inmediato por su seguridad.',
    fr: 'Veuillez vous déplacer immédiatement vers une zone couverte pour votre sécurité.',
    ar: 'يرجى الانتقال فورًا إلى منطقة مسقوفة لسلامتك.',
    pt: 'Por favor, mova-se para uma área coberta imediatamente por sua segurança.',
    hi: 'कृपया अपनी सुरक्षा के लिए तुरंत एक ढके हुए क्षेत्र में चले जाएं।',
  },
  'lost-item': {
    en: 'Please go to the Lost & Found desk at Gate 1 or Gate 8. Show them this card.',
    es: 'Por favor, diríjase al mostrador de objetos perdidos en la Puerta 1 o Puerta 8.',
    fr: 'Veuillez vous rendre au bureau des objets trouvés à la Porte 1 ou à la Porte 8.',
    ar: 'يرجى التوجه إلى مكتب الأشياء المفقودة عند البوابة 1 أو البوابة 8.',
    pt: 'Por favor, vá ao balcão de achados e perdidos na Porta 1 ou Porta 8.',
    hi: 'कृपया गेट 1 या गेट 8 पर लॉस्ट एंड फाउंड काउंटर पर जाएं।',
  },
  'navigation': {
    en: 'Follow me, I will guide you there. / Your destination is in that direction.',
    es: 'Sígame, le llevaré allí. / Su destino está en esa dirección.',
    fr: 'Suivez-moi, je vais vous y conduire. / Votre destination est dans cette direction.',
    ar: 'اتبعني، سأرشدك إلى هناك. / وجهتك في تلك الاتجاه.',
    pt: 'Siga-me, vou guiá-lo até lá. / O seu destino fica nessa direção.',
    hi: 'मेरे पीछे आएं, मैं आपको वहाँ ले जाऊंगा। / आपका गंतव्य उस दिशा में है।',
  },
  'general': {
    en: 'How can I assist you? Please tell me what happened.',
    es: '¿Cómo puedo ayudarle? Por favor, dígame qué pasó.',
    fr: 'Comment puis-je vous aider ? Dites-moi ce qui s\'est passé.',
    ar: 'كيف يمكنني مساعدتك؟ من فضلك أخبرني بما حدث.',
    pt: 'Como posso ajudá-lo? Por favor, diga-me o que aconteceu.',
    hi: 'मैं आपकी कैसे सहायता कर सकता हूं? कृपया मुझे बताएं क्या हुआ।',
  },
};

/**
 * Return the multilingual phrase for a given incident category and language.
 * Always returns a non-empty string (falls back to English if needed).
 */
export function buildMultilingualTemplate(
  category: IncidentCategory,
  language: SupportedLanguage,
): string {
  const categoryPhrases = PHRASE_BANK[category] ?? PHRASE_BANK['general'];
  return categoryPhrases[language] ?? categoryPhrases['en'];
}

/** Expose phrase bank for testing (read-only view) */
export const SUPPORTED_CATEGORIES = Object.keys(PHRASE_BANK) as IncidentCategory[];
export const SUPPORTED_LANGUAGES_LIST = ['en', 'es', 'fr', 'ar', 'pt', 'hi'] as SupportedLanguage[];
