import { useEffect, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState, Prec } from '@codemirror/state'
import { indentWithTab, toggleComment } from '@codemirror/commands'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { tags as t } from '@lezer/highlight'

// Même palette que les blocs de code du site (lib/highlight.ts)
const colors = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword, t.definitionKeyword, t.modifier], color: '#7dd3fc', fontWeight: '600' },
  { tag: [t.string, t.special(t.string), t.regexp], color: '#fcd34d' },
  { tag: [t.number, t.bool, t.null, t.atom], color: '#fdba74' },
  { tag: [t.lineComment, t.blockComment], color: '#64748b', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))], color: '#6ee7b7' },
  { tag: [t.className, t.definition(t.className), t.typeName], color: '#c4b5fd' },
  { tag: [t.self, t.special(t.variableName)], color: '#f9a8d4' },
  { tag: [t.operator, t.punctuation], color: '#cbd5e1' },
])

const theme = EditorView.theme(
  {
    '&': { backgroundColor: 'transparent', color: '#f1f5f9', fontSize: '13px' },
    '.cm-content': { fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace', padding: '12px 0', caretColor: '#f1f5f9' },
    '.cm-scroller': { lineHeight: '1.65' },
    '.cm-gutters': { backgroundColor: 'transparent', color: '#475569', border: 'none' },
    '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'rgba(148, 163, 184, 0.07)' },
    '&.cm-focused': { outline: 'none' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'rgba(99, 102, 241, 0.4)' },
    '&.cm-focused .cm-cursor': { borderLeftColor: '#f1f5f9' },
    '.cm-matchingBracket': { backgroundColor: 'rgba(99, 102, 241, 0.35)', outline: 'none' },
    '.cm-tooltip': { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' },
    '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: '#4f46e5', color: 'white' },
  },
  { dark: true },
)

type Props = {
  value: string
  onChange: (v: string) => void
  /** ⌘/Ctrl + Entrée */
  onRun?: () => void
  minHeight?: string
  maxHeight?: string
}

/** Éditeur JavaScript (CodeMirror 6), thème sombre. */
export function JsEditor({ value, onChange, onRun, minHeight = '220px', maxHeight = '65vh' }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  // Les raccourcis lisent toujours les derniers callbacks, sans recréer l'éditeur
  const cb = useRef({ onChange, onRun })
  cb.current = { onChange, onRun }

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          Prec.highest(
            keymap.of([
              { key: 'Mod-Enter', run: () => (cb.current.onRun?.(), true) },
              // Mod-/ ne part pas en AZERTY, où « / » se tape avec Maj + « : »
              { key: 'Mod-:', run: toggleComment },
              { key: 'Shift-Mod-:', run: toggleComment },
            ]),
          ),
          basicSetup,
          keymap.of([indentWithTab]),
          javascript(),
          syntaxHighlighting(colors),
          theme,
          EditorView.theme({ '.cm-scroller': { minHeight, maxHeight } }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) cb.current.onChange(u.state.doc.toString())
          }),
        ],
      }),
    })
    view.current = v
    return () => {
      v.destroy()
      view.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Texte changé depuis l'extérieur (« ▶ Playground » d'un bloc, réinitialisation)
  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
  }, [value])

  return <div ref={host} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 dark:border-slate-700" />
}
