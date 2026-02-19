/**
 * Human-friendly one-line summary of what went wrong.
 */
function friendlySummary(message, position, line) {
  const hasPos = position != null;
  const hasLine = line != null;
  const where = hasLine && hasPos ? ` at line ${line}, character ${position}` : hasLine ? ` at line ${line}` : hasPos ? ` at character ${position}` : '';
  if (message.includes('Expected \',\' or \'}\'') || message.includes("Expected ',' or '}'")) return `Missing comma or closing brace after a property value${where}.`;
  if (message.includes('Unexpected token') || message.includes('Unexpected end')) {
    const token = message.match(/Unexpected token (.+?)\./)?.[1] || message.match(/Unexpected (.+?) in JSON/)?.[1];
    const part = token ? ` (${token})` : '';
    return message.includes('Unexpected end') ? `JSON ended too early${where}.` : `Invalid token${part}${where}.`;
  }
  if (message.includes('property name') && message.includes('JSON')) return `Missing or invalid property name${where}.`;
  if (message.includes('Bad control character') || message.includes('control character')) return `Invalid control character in string${where}.`;
  if (message.includes('Unterminated string')) return `String is not closed (missing quote)${where}.`;
  if (message.includes('No number after minus') || message.includes('Unexpected number')) return `Invalid number${where}.`;
  return `Parse error${where}: ${message.slice(0, 60)}${message.length > 60 ? '…' : ''}`;
}

/**
 * Clear "how to fix" instructions for each error type.
 */
function howToFix(message, charAt) {
  if (message.includes('Expected \',\' or \'}\'') || message.includes("Expected ',' or '}'")) return 'Put a comma (,) between property values. Often the issue is a typo: a period (.) or other character where a comma should be—replace it with a comma.';
  if (message.includes('Unexpected end')) return 'Add the missing closing bracket(s), brace(s), or quote so the JSON is complete.';
  if (message.includes('Unexpected token') && (message.includes('"') || message.includes("'"))) return 'Check for an unescaped quote inside a string, or a missing comma between values.';
  if (message.includes('Unexpected token \',\'') || message.includes('Unexpected token ","')) return 'Remove the extra comma (e.g. before ] or }, or after the last item).';
  if (message.includes('Unexpected token \'}\'') || message.includes('Unexpected token \']\'')) return 'Remove the extra } or ], or add the missing property/value before it.';
  if (message.includes('Unexpected token') && message.includes('in JSON')) return 'Replace the invalid character with what JSON expects: usually a comma (,) between items, or remove a stray character (e.g. a period . where a comma should be).';
  if (message.includes('property name') && message.includes('JSON')) return 'Use double quotes for property names (e.g. "name": "value"). Add a comma between properties and no comma after the last one.';
  if (message.includes('Bad control character') || message.includes('control character')) return 'Remove or escape control characters (e.g. tab, newline) inside strings. Use \\n for newline and \\t for tab.';
  if (message.includes('Unterminated string')) return 'Add a closing double quote (") to end the string. Escape any " inside the string with \\.';
  if (message.includes('No number after minus')) return 'Put a digit after the minus sign (e.g. -0 or -42) or remove the stray minus.';
  if (message.includes('Unexpected number')) return 'Add a comma between numbers or fix the number format (no leading zeros like 01, use 0.5 for decimals).';
  return 'Fix or remove the invalid character at the position shown, then run the check again to see if there are more errors.';
}

/**
 * Try to parse JSON. Returns either { ok: true, data } or { ok: false, ...single error }.
 * Only the first error is reported so you can fix it and re-check.
 */
export function checkSyntax(text) {
  try {
    const data = JSON.parse(text);
    return { ok: true, data, message: 'Valid JSON.' };
  } catch (e) {
    const posMatch = e.message.match(/position (\d+)/);
    let position = null;
    let line = null;
    let context = '';
    let contextStart = 0;
    let charAt = '';

    if (posMatch) {
      position = parseInt(posMatch[1], 10);
      const start = Math.max(0, position - 80);
      contextStart = start;
      context = text.slice(start, position + 80);
      charAt = text[position];
      line = text.slice(0, position).split(/\r\n|\r|\n/).length;
    }

    const summary = friendlySummary(e.message, position, line);
    const howToFixMsg = howToFix(e.message, charAt);

    return {
      ok: false,
      message: e.message,
      summary,
      howToFix: howToFixMsg,
      position,
      line,
      context,
      contextStart,
      charAt: charAt != null ? `${JSON.stringify(charAt)} (code ${charAt.charCodeAt(0)})` : 'n/a',
    };
  }
}

/**
 * Check for duplicate entries. Assumes data is an array of objects.
 */
export function checkDuplicates(data) {
  if (!Array.isArray(data)) {
    return { ok: false, message: 'Root is not an array. Duplicate check expects a JSON array.' };
  }

  const byKey = new Map();
  const duplicates = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const id = item && typeof item === 'object' && 'id' in item ? item.id : undefined;
    const key = id != null ? String(id) : JSON.stringify(item);

    if (byKey.has(key)) {
      duplicates.push({
        index: i,
        key: key.length > 60 ? key.slice(0, 60) + '…' : key,
        firstSeenIndex: byKey.get(key),
      });
    } else {
      byKey.set(key, i);
    }
  }

  return {
    ok: true,
    total: data.length,
    duplicateCount: duplicates.length,
    duplicates,
  };
}
