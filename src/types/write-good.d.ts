declare module 'write-good' {
  export type WriteGoodSuggestion = {
    index: number;
    offset: number;
    reason: string;
  };

  type WriteGoodOptions = {
    passive?: boolean;
    illusion?: boolean;
    so?: boolean;
    thereIs?: boolean;
    weasel?: boolean;
    adverb?: boolean;
    tooWordy?: boolean;
    cliches?: boolean;
    eprime?: boolean;
    whitelist?: string[];
    checks?: Record<string, unknown>;
  };

  export default function writeGood(text: string, opts?: WriteGoodOptions): WriteGoodSuggestion[];
}
