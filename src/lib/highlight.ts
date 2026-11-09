import { parser } from '@lezer/javascript'
import { highlightCode, tagHighlighter, tags as t } from '@lezer/highlight'

// Même palette que l'éditeur CodeMirror (components/JsEditor.tsx)
const highlighter = tagHighlighter([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword, t.definitionKeyword, t.modifier], class: 'text-sky-300 font-semibold' },
  { tag: [t.string, t.special(t.string), t.regexp], class: 'text-amber-300' },
  { tag: [t.number, t.bool, t.null, t.atom], class: 'text-orange-300' },
  { tag: [t.lineComment, t.blockComment], class: 'text-slate-500 italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))], class: 'text-emerald-300' },
  { tag: [t.className, t.definition(t.className), t.typeName], class: 'text-violet-300' },
  { tag: [t.self, t.special(t.variableName)], class: 'text-pink-300' },
])

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Code JS → HTML coloré (classes Tailwind). */
export function highlightJs(code: string): string {
  let html = ''
  try {
    highlightCode(
      code,
      parser.parse(code),
      highlighter,
      (text, classes) => {
        html += classes ? `<span class="${classes}">${esc(text)}</span>` : esc(text)
      },
      () => {
        html += '\n'
      },
    )
    return html
  } catch {
    return esc(code)
  }
}
