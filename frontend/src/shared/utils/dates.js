const DEFAULT_LOCALE = 'el-GR';
const DEFAULT_OPTIONS = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/**
 * Format an ISO date string in Greek locale while tolerating invalid inputs.
 * When the value cannot be parsed it falls back to the original string unless a
 * custom fallback is provided.
 */
export function formatDate(iso, { locale = DEFAULT_LOCALE, options, fallback = 'original' } = {}) {
  if (!iso) {
    return fallback === 'original' ? '-' : fallback;
  }

  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const merged = options ? { ...DEFAULT_OPTIONS, ...options } : DEFAULT_OPTIONS;
    const formatOptions = Object.fromEntries(
      Object.entries(merged).filter(([, value]) => value !== undefined)
    );
    return date.toLocaleString(locale, formatOptions);
  } catch {
    return fallback === 'original' ? iso : fallback;
  }
}

export function formatDateOnly(iso, { locale = DEFAULT_LOCALE, fallback = 'original' } = {}) {
  return formatDate(iso, {
    locale,
    fallback,
    options: {
      hour: undefined,
      minute: undefined,
    },
  });
}
