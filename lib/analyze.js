/**
 * Try to parse JSON and return either the parsed value or a detailed error.
 */
export function checkSyntax(text) {
  try {
    const data = JSON.parse(text);
    return { ok: true, data, message: 'Valid JSON.' };
  } catch (e) {
    const posMatch = e.message.match(/position (\d+)/);
    let context = '';
    let charAt = '';
    let position = null;
    let line = null;
    if (posMatch) {
      position = parseInt(posMatch[1], 10);
      const start = Math.max(0, position - 80);
      context = text.slice(start, position + 80);
      charAt = text[position];
      line = text.slice(0, position).split(/\r\n|\r|\n/).length;
    }
    return {
      ok: false,
      message: e.message,
      position,
      line,
      context,
      charAt: charAt != null ? `${JSON.stringify(charAt)} (code ${charAt.charCodeAt(0)})` : 'n/a',
    };
  }
}

/**
 * Check for duplicate entries. Assumes data is an array of objects.
 * Looks for duplicate `id` first; if no `id`, uses JSON string of object.
 */
export function checkDuplicates(data) {
  if (!Array.isArray(data)) {
    return { ok: false, message: 'Root is not an array. Duplicate check expects a JSON array.' };
  }

  const byId = new Map();
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
