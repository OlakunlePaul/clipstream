export enum ContentType {
  API_KEY = "API_KEY",
  COMMAND = "COMMAND",
  CODE = "CODE",
  FILE_PATH = "FILE_PATH",
  URL = "URL",
  ERROR_TRACE = "ERROR_TRACE",
  TEXT = "TEXT",
}

export interface ClassifiedContent {
  type: ContentType;
  displayValue: string;
  isSensitive: boolean;
}

const PATTERNS = {
  API_KEY: [
    /sk-[a-zA-Z0-9]{20,}/,
    /AKIA[A-Z0-9]{16}/,
    /ghp_[a-zA-Z0-9]{36}/,
    /xoxb-[0-9-]+/,
    /Bearer [a-zA-Z0-9._-]+/,
  ],
  COMMAND: [
    /^[$>#]\s/,
    /^(npm|yarn|pnpm|git|curl|ssh|docker|kubectl|cd|ls|cat|brew)\s/,
  ],
  CODE: [
    /[{};=>]/,
    /\b(function|const|let|def|class|import|return)\b/,
  ],
  FILE_PATH: [
    /^\//,
    /^~\//,
    /^[a-zA-Z]:\\/,
    /^\.\//,
    /^\.\.\//,
  ],
  URL: [
    /^(http:\/\/|https:\/\/|ftp:\/\/)/,
  ],
  ERROR_TRACE: [
    /Error:|Exception:|Traceback|at line|stack trace/i,
  ],
};

export function classifyClip(text: string): ClassifiedContent {
  const trimmed = text.trim();

  // 1. Check API Keys (Sensitive)
  for (const pattern of PATTERNS.API_KEY) {
    if (pattern.test(trimmed)) {
      return {
        type: ContentType.API_KEY,
        displayValue: maskValue(trimmed),
        isSensitive: true,
      };
    }
  }

  // 2. Check URL
  if (PATTERNS.URL[0].test(trimmed)) {
    return {
      type: ContentType.URL,
      displayValue: trimmed,
      isSensitive: false,
    };
  }

  // 3. Check Command
  for (const pattern of PATTERNS.COMMAND) {
    if (pattern.test(trimmed)) {
      return {
        type: ContentType.COMMAND,
        displayValue: trimmed,
        isSensitive: false,
      };
    }
  }

  // 4. Check File Path
  for (const pattern of PATTERNS.FILE_PATH) {
    if (pattern.test(trimmed)) {
      return {
        type: ContentType.FILE_PATH,
        displayValue: trimmed,
        isSensitive: false,
      };
    }
  }

  // 5. Check Error Trace
  if (PATTERNS.ERROR_TRACE[0].test(trimmed)) {
    return {
      type: ContentType.ERROR_TRACE,
      displayValue: trimmed,
      isSensitive: false,
    };
  }

  // 6. Check Code
  for (const pattern of PATTERNS.CODE) {
    if (pattern.test(trimmed)) {
      return {
        type: ContentType.CODE,
        displayValue: trimmed,
        isSensitive: false,
      };
    }
  }

  // 7. Fallback to Text
  return {
    type: ContentType.TEXT,
    displayValue: trimmed,
    isSensitive: false,
  };
}

function maskValue(val: string): string {
  if (val.length <= 4) return "••••";
  const lastFour = val.slice(-4);
  return `••••${lastFour}`;
}
