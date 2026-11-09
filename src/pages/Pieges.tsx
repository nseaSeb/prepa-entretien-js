import { useState } from 'react'
import { pieges } from '../data/pieges'
import { themeLabel, themes } from '../data/themes'
import { useStored } from '../lib/storage'
import { KEYS } from '../lib/progress'
import { useNav } from '../lib/nav'
import { Button, Card, Code, OutputBox, PageHeader, Tag } from '../components/ui'
import { Rich } from '../components/Rich'
import { ThemeFilter } from '../components/ThemeFilter'


export default function Pieges() {
  const { go } = useNav()
  const [seen, setSeen] = useStored<string[]>(KEYS.pieges, [])
  const [open, setOpen] = useState<string[]>([])
  const [theme, setTheme] = useState('all')
  const counts = Object.fromEntries(themes.map((t) => [t.id, pieges.filter((p) => p.theme === t.id).length]))
  const list = pieges.filter((p) => theme === 'all' || p.theme === theme)
  const reveal = (id: string) => {
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]))
    if (!seen.includes(id)) setSeen([...seen, id])
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Pièges classiques"
        subtitle={`${pieges.length} extraits qui reviennent sans cesse en entretien. Pour chacun, annonce la sortie à voix haute en déroulant le raisonnement, puis révèle la réponse. Chaque sortie est vérifiée par les tests ; les pièges TypeScript sont en plus vérifiés par le compilateur.`}
      >
        <div className="mt-3 text-sm text-slate-500">
          {seen.filter((id) => pieges.some((p) => p.id === id)).length} / {pieges.length} vus ·{' '}
          <button className="underline" onClick={() => setSeen([])}>
            réinitialiser
          </button>
        </div>
      </PageHeader>
      <ThemeFilter value={theme} onChange={setTheme} counts={counts} />
      <div className="space-y-5">
        {list.map((p) => {
          const isOpen = open.includes(p.id)
          return (
            <Card key={p.id} id={p.id}>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-slate-900 dark:text-white">{p.title}</h2>
                <button onClick={() => go('cours', p.theme)}>
                  <Tag color="sky">{themeLabel(p.theme)}</Tag>
                </button>
                {seen.includes(p.id) && <Tag color="emerald">vu</Tag>}
              </div>
              <p className="mt-2 text-[15px]">{p.question}</p>
              <Code code={p.code} lang={p.lang} />
              <Button variant={isOpen ? 'ghost' : 'primary'} onClick={() => reveal(p.id)}>
                {isOpen ? 'Masquer la réponse' : 'Révéler la réponse'}
              </Button>
              {isOpen && (
                <div className="mt-4">
                  {p.output !== undefined && (
                    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                      <OutputBox text={p.output} />
                    </div>
                  )}
                  <Rich text={p.explanation} className="mt-3 text-[15px]" />
                  {p.fix && (
                    <>
                      <div className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">Version corrigée</div>
                      <Code code={p.fix.code} output={p.fix.output} run={p.fix.run !== false} lang={p.fix.lang ?? p.lang} />
                    </>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
