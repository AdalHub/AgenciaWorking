import writeGood from 'write-good';
import nspell from 'nspell';
import affData from './dictionaries/es.aff?raw';
import dicData from './dictionaries/es.dic?raw';

export type WritingSuggestion = {
  id: string;
  index: number;
  offset: number;
  reason: string;
  replacement?: string;
};

type WriteGoodSuggestion = {
  index: number;
  offset: number;
  reason: string;
};

const spell = nspell(affData, dicData);

const SPANISH_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string; reason: string }> = [
  { pattern: /\bconyuge\b/gi, replacement: 'cónyuge', reason: 'Considere escribir "cónyuge" con acento.' },
  { pattern: /\btelefono\b/gi, replacement: 'teléfono', reason: 'Considere escribir "teléfono" con acento.' },
  { pattern: /\belectronico\b/gi, replacement: 'electrónico', reason: 'Considere escribir "electrónico" con acento.' },
  { pattern: /\bdireccion\b/gi, replacement: 'dirección', reason: 'Considere escribir "dirección" con acento.' },
  { pattern: /\bocupacion\b/gi, replacement: 'ocupación', reason: 'Considere escribir "ocupación" con acento.' },
  { pattern: /\bprofesion\b/gi, replacement: 'profesión', reason: 'Considere escribir "profesión" con acento.' },
  { pattern: /\binformacion\b/gi, replacement: 'información', reason: 'Considere escribir "información" con acento.' },
  { pattern: /\bsituacion\b/gi, replacement: 'situación', reason: 'Considere escribir "situación" con acento.' },
  { pattern: /\beconomico\b/gi, replacement: 'económico', reason: 'Considere escribir "económico" con acento.' },
  { pattern: /\bfiscal actualizada\b/gi, replacement: 'fiscal actualizada', reason: 'Revise que la redacción sea clara y completa.' },
  { pattern: /\bsenas\b/gi, replacement: 'señas', reason: 'Considere escribir "señas" con eñe.' },
  { pattern: /\bnumero\b/gi, replacement: 'número', reason: 'Considere escribir "número" con acento.' },
  { pattern: /\bcodigo\b/gi, replacement: 'código', reason: 'Considere escribir "código" con acento.' },
  { pattern: /\bperiodo\b/gi, replacement: 'período', reason: 'Considere escribir "período" con acento.' },
  { pattern: /\bMexico\b/g, replacement: 'México', reason: 'Considere escribir "México" con acento.' },
  { pattern: /\bmexico\b/g, replacement: 'México', reason: 'Considere escribir "México" con acento y mayúscula inicial.' },
  { pattern: /\bsolo\b/gi, replacement: 'solo', reason: 'Revise si este "solo" requiere acento por claridad.' },
  { pattern: /\bxq\b/gi, replacement: 'porque', reason: 'Evite abreviaturas informales como "xq".' },
  { pattern: /\bpq\b/gi, replacement: 'porque', reason: 'Evite abreviaturas informales como "pq".' },
  { pattern: /\bq\b/gi, replacement: 'que', reason: 'Evite abreviaturas informales como "q".' },
  { pattern: /\bkm\b/gi, replacement: 'km', reason: 'Revise si conviene escribir la unidad completa para mayor claridad.' },
];

function buildSuggestionId(kind: string, index: number, offset: number): string {
  return `${kind}:${index}:${offset}`;
}

function pushUnique(
  bucket: WritingSuggestion[],
  seen: Set<string>,
  suggestion: WritingSuggestion,
): void {
  if (seen.has(suggestion.id)) return;
  seen.add(suggestion.id);
  bucket.push(suggestion);
}

function normalizeWriteGoodReason(reason: string): string {
  if (!reason) return 'Revise la redaccion de esta parte del texto.';
  const cleaned = reason.replace(/\s+/g, ' ').trim();
  return `Sugerencia de redaccion: ${cleaned}`;
}

function addLocalSuggestions(input: string, suggestions: WritingSuggestion[], seen: Set<string>): void {
  const trimmedStart = input.match(/^\s+/);
  if (trimmedStart) {
    pushUnique(suggestions, seen, {
      id: buildSuggestionId('trim-start', 0, trimmedStart[0].length),
      index: 0,
      offset: trimmedStart[0].length,
      reason: 'Quite los espacios innecesarios al inicio del texto.',
      replacement: '',
    });
  }

  const trimmedEnd = input.match(/\s+$/);
  if (trimmedEnd) {
    pushUnique(suggestions, seen, {
      id: buildSuggestionId('trim-end', input.length - trimmedEnd[0].length, trimmedEnd[0].length),
      index: input.length - trimmedEnd[0].length,
      offset: trimmedEnd[0].length,
      reason: 'Quite los espacios innecesarios al final del texto.',
      replacement: '',
    });
  }

  for (const match of input.matchAll(/ {2,}/g)) {
    if (typeof match.index !== 'number') continue;
    pushUnique(suggestions, seen, {
      id: buildSuggestionId('double-space', match.index, match[0].length),
      index: match.index,
      offset: match[0].length,
      reason: 'Use un solo espacio entre palabras.',
      replacement: ' ',
    });
  }

  for (const match of input.matchAll(/\s+([,.;:!?])/g)) {
    if (typeof match.index !== 'number') continue;
    pushUnique(suggestions, seen, {
      id: buildSuggestionId('space-before-punct', match.index, match[0].length),
      index: match.index,
      offset: match[0].length,
      reason: 'Evite dejar espacios antes de un signo de puntuacion.',
      replacement: match[1],
    });
  }

  for (const match of input.matchAll(/([,.;:!?]){2,}/g)) {
    if (typeof match.index !== 'number') continue;
    pushUnique(suggestions, seen, {
      id: buildSuggestionId('duplicated-punct', match.index, match[0].length),
      index: match.index,
      offset: match[0].length,
      reason: 'Use un solo signo de puntuacion.',
      replacement: match[0].charAt(0),
    });
  }

  for (const match of input.matchAll(/\b([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,})\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,})\b/g)) {
    if (typeof match.index !== 'number') continue;
    if (match[1].toLocaleLowerCase('es-MX') !== match[2].toLocaleLowerCase('es-MX')) continue;
    pushUnique(suggestions, seen, {
      id: buildSuggestionId('repeated-word', match.index, match[0].length),
      index: match.index,
      offset: match[0].length,
      reason: `La palabra "${match[1]}" parece repetida.`,
      replacement: match[1],
    });
  }

  for (const match of input.matchAll(/(^|[.!?]\s+)([a-záéíóúüñ])/g)) {
    if (typeof match.index !== 'number') continue;
    const prefix = match[1] ?? '';
    const index = match.index + prefix.length;
    pushUnique(suggestions, seen, {
      id: buildSuggestionId('sentence-case', index, 1),
      index,
      offset: 1,
      reason: 'Considere iniciar la oracion con mayuscula.',
      replacement: match[2].toLocaleUpperCase('es-MX'),
    });
  }

  for (const item of SPANISH_REPLACEMENTS) {
    for (const match of input.matchAll(item.pattern)) {
      if (typeof match.index !== 'number') continue;
      pushUnique(suggestions, seen, {
        id: buildSuggestionId(`spanish-${item.replacement}`, match.index, match[0].length),
        index: match.index,
        offset: match[0].length,
        reason: item.reason,
        replacement: item.replacement,
      });
    }
  }

  for (const match of input.matchAll(/\p{L}+/gu)) {
    if (typeof match.index !== 'number') continue;
    const word = match[0];
    const normalized = word.toLocaleLowerCase('es-MX');
    if (['a', 'al', 'de', 'del', 'el', 'en', 'la', 'las', 'lo', 'los', 'mi', 'no', 'o', 'se', 'si', 'su', 'te', 'tu', 'un', 'una', 'y'].includes(normalized)) {
      continue;
    }

    const vowels = (normalized.match(/[aeiouáéíóúü]/g) ?? []).length;
    const consonants = (normalized.match(/[bcdfghjklmnñpqrstvwxyz]/g) ?? []).length;
    const looksTooShort = normalized.length === 1;
    const looksGibberish = normalized.length >= 3 && (vowels === 0 || (consonants >= 3 && vowels <= 1));

    if (!looksTooShort && !looksGibberish) continue;

    pushUnique(suggestions, seen, {
      id: buildSuggestionId('possible-typo', match.index, word.length),
      index: match.index,
      offset: word.length,
      reason: `La palabra "${word}" parece tener un posible error ortografico.`,
    });
  }

  for (const match of input.matchAll(/\p{L}+/gu)) {
    if (typeof match.index !== 'number') continue;
    const word = match[0];
    const normalized = word.toLocaleLowerCase('es-MX');
    if (word.length < 3) continue;
    if (/^\d+$/.test(word)) continue;
    if (['curp', 'rfc', 'imss', 'ine'].includes(normalized)) continue;
    if (spell.correct(word)) continue;

    const candidate = spell
      .suggest(word)
      .find((item) => item && item.toLocaleLowerCase('es-MX') !== normalized);

    pushUnique(suggestions, seen, {
      id: buildSuggestionId('spanish-spell', match.index, word.length),
      index: match.index,
      offset: word.length,
      reason: candidate
        ? `La palabra "${word}" parece estar mal escrita. Sugerencia: "${candidate}".`
        : `La palabra "${word}" parece estar mal escrita.`,
      replacement: candidate,
    });
  }
}

export function analyzeWritingSuggestions(text: string): WritingSuggestion[] {
  const input = String(text ?? '');
  const suggestions: WritingSuggestion[] = [];
  const seen = new Set<string>();

  if (!input.trim()) {
    return suggestions;
  }

  addLocalSuggestions(input, suggestions, seen);

  const writeGoodSuggestions = writeGood(input, {
    passive: false,
    eprime: false,
  }) as WriteGoodSuggestion[];

  for (const item of writeGoodSuggestions) {
    pushUnique(suggestions, seen, {
      id: buildSuggestionId('write-good', item.index, item.offset),
      index: item.index,
      offset: item.offset,
      reason: normalizeWriteGoodReason(item.reason),
    });
  }

  return suggestions
    .sort((a, b) => a.index - b.index)
    .slice(0, 5);
}
