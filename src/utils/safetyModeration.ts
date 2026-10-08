import { SafetyCheckResult } from '../types';

// Multi-category Safety & Ethics Moderation Filters
const BANNED_PATTERNS: { category: SafetyCheckResult['category']; pattern: RegExp; message: string }[] = [
  {
    category: 'political',
    pattern: /\b(election fraud|assassinate president|political coup|deepfake trump|deepfake biden|deepfake putin|overthrow government|terrorist manifesto|extremist propaganda|political revolt)\b/i,
    message: 'Political propaganda, government subversion, and deepfakes of political figures are strictly prohibited.'
  },
  {
    category: 'nsfw',
    pattern: /\b(nude|nudity|naked|porn|pornographic|nsfw|erotic|sex|sexual|genitals|undress|stripping|hentai|orgasm|incest|fetish)\b/i,
    message: 'Adult, sexual, or non-consensual sexually explicit content is prohibited by our community safety guidelines.'
  },
  {
    category: 'violence',
    pattern: /\b(decapitate|slaughter|bloodbath|torture|mutilation|suicide|kill yourself|mass shooting|beheading|car bomb|suicide vest|execution video)\b/i,
    message: 'Graphic violence, self-harm, cruelty, and terror imagery violate our ethical guidelines.'
  },
  {
    category: 'illegal',
    pattern: /\b(buy cocaine|heroin recipe|make bomb|untraceable weapon|ghost gun blueprint|malware attack|ransomware attack|stolen credit card)\b/i,
    message: 'Prompts describing illicit narcotics manufacturing, cyberattacks, or illegal weapons are prohibited.'
  },
  {
    category: 'hate',
    pattern: /\b(nazi salute|swastika march|racial slur|genocide praise|white supremacy|hate crime against)\b/i,
    message: 'Hate speech, ethnic incitement, and discriminatory content are banned.'
  }
];

export function evaluatePromptSafety(prompt: string): SafetyCheckResult {
  const normalized = prompt.trim();
  if (!normalized) {
    return { isSafe: true, category: 'none' };
  }

  for (const rule of BANNED_PATTERNS) {
    if (rule.pattern.test(normalized)) {
      const match = normalized.match(rule.pattern);
      return {
        isSafe: false,
        reason: rule.message,
        category: rule.category,
        flaggedKeywords: match ? [match[0]] : []
      };
    }
  }

  return { isSafe: true, category: 'none' };
}
