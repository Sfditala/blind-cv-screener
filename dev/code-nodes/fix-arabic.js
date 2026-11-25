// PDF text extraction returns Arabic in *visual* order, one glyph per piece, in presentation
// forms (e.g. "ﺐ ﻴ ﻄ ﺨ ﻟ ا" for "الخطيب"). This repairs it line by line.
// Rule: reverse the ORDER of the pieces, never the letters inside a piece
// (multi-letter pieces and Latin words already come out in the right order),
// and normalize the presentation forms only AFTER reversing, so ligatures like ﻼ stay intact.
const PRESENTATION = /[ﭐ-﷿ﹰ-﻿]/;
function fixArabicLine(line) {
  if (!PRESENTATION.test(line)) return line;
  const words = line.trim().split(/\s{2,}/).map((w) => {
    const parts = w.split(' ').filter(Boolean);
    const glyphy = parts.filter((p) => [...p].length <= 2).length / parts.length > 0.6;
    return parts.reverse().join(glyphy ? '' : ' ');
  });
  return words.reverse().join(' ').normalize('NFKC').replace(/ ([\u064B-\u0652])/g, '$1'); // no space before diacritics
}
function fixArabic(text) {
  return String(text).split('\n').map(fixArabicLine).join('\n');
}
if (typeof module !== 'undefined') module.exports = { fixArabic };
