/**
 * Formatage des valeurs pour la console du bac à sable, proche de Node (`util.inspect`).
 * Fonctionne entre royaumes (worker, contexte vm) : jamais d'`instanceof`, seulement
 * `Array.isArray` et `Object.prototype.toString`.
 */

const tag = (v: unknown) => Object.prototype.toString.call(v).slice(8, -1)
const IDENT = /^[A-Za-z_$][\w$]*$/

function quote(s: string) {
  if (!s.includes("'")) return `'${s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')}'`
  if (!s.includes('"')) return `"${s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')}"`
  return '`' + s.replace(/\\/g, '\\\\').replace(/`/g, '\\`') + '`'
}

function isError(v: object): boolean {
  if (tag(v) === 'Error') return true
  const o = v as { name?: unknown; message?: unknown; stack?: unknown }
  return typeof o.message === 'string' && typeof o.name === 'string' && typeof o.stack === 'string'
}

/** « TypeError: x is not a function » */
export function formatError(e: unknown): string {
  if (e !== null && typeof e === 'object' && isError(e)) {
    const { name, message } = e as Error
    return message ? `${name}: ${message}` : String(name)
  }
  return formatValue(e, true)
}

function fnLabel(f: Function): string {
  let src = ''
  try {
    src = Function.prototype.toString.call(f)
  } catch {
    /* proxy */
  }
  if (src.startsWith('class')) return f.name ? `[class ${f.name}]` : '[class (anonymous)]'
  return f.name ? `[Function: ${f.name}]` : '[Function (anonymous)]'
}

function ctorName(o: object): string | null {
  const proto = Object.getPrototypeOf(o)
  if (proto === null) return null
  const c = proto.constructor
  return typeof c === 'function' && typeof c.name === 'string' ? c.name : ''
}

function key(k: string | symbol) {
  if (typeof k === 'symbol') return `[${k.toString()}]`
  return IDENT.test(k) ? k : quote(k)
}

function braces(prefix: string, items: string[], open = '{', close = '}') {
  const p = prefix ? prefix + ' ' : ''
  return items.length ? `${p}${open} ${items.join(', ')} ${close}` : `${p}${open}${close}`
}

function props(o: object, seen: object[], depth: number, skipIndices = false): string[] {
  const out: string[] = []
  for (const k of Reflect.ownKeys(o)) {
    const d = Object.getOwnPropertyDescriptor(o, k)
    if (!d || !d.enumerable) continue
    if (skipIndices && typeof k === 'string' && /^\d+$/.test(k)) continue
    let val: string
    if (d.get || d.set) val = d.get && d.set ? '[Getter/Setter]' : d.get ? '[Getter]' : '[Setter]'
    else val = inner(d.value, seen, depth + 1)
    out.push(`${key(k)}: ${val}`)
  }
  return out
}

const MAX_DEPTH = 2

function inner(v: unknown, seen: object[], depth: number): string {
  switch (typeof v) {
    case 'string':
      return quote(v)
    case 'number':
      return Object.is(v, -0) ? '-0' : String(v)
    case 'bigint':
      return `${v}n`
    case 'boolean':
    case 'undefined':
      return String(v)
    case 'symbol':
      return v.toString()
    case 'function': {
      // propriétés propres (ex. `f.self = f`, `static me = A`) : mêmes règles de cycle et de profondeur que les objets
      if (seen.includes(v)) return '[Circular]'
      const hasProps = Reflect.ownKeys(v).some((k) => Object.getOwnPropertyDescriptor(v, k)?.enumerable)
      if (!hasProps) return fnLabel(v)
      if (depth > MAX_DEPTH) return '[Function]'
      return braces(fnLabel(v), props(v, [...seen, v], depth))
    }
  }
  if (v === null) return 'null'
  const o = v as object
  if (seen.includes(o)) return '[Circular]'
  const t = tag(o)

  if (t === 'Date') {
    const time = (o as Date).getTime()
    return Number.isNaN(time) ? 'Invalid Date' : (o as Date).toISOString()
  }
  if (t === 'RegExp') return String(o)
  if (isError(o)) return depth === 0 ? formatError(o) : `[${formatError(o)}]`
  if (t === 'Number' || t === 'String' || t === 'Boolean') {
    const prim = (o as { valueOf(): unknown }).valueOf()
    return `[${t}: ${inner(prim, seen, depth)}]`
  }
  if (t === 'Promise') return 'Promise { <état non inspectable> }'
  if (t === 'WeakMap' || t === 'WeakSet') return `${t} { <items unknown> }`

  const isArr = Array.isArray(o)
  if (depth > MAX_DEPTH) return isArr ? '[Array]' : t === 'Object' ? `[${ctorName(o) || 'Object'}]` : `[${t}]`
  seen = [...seen, o]

  if (isArr) {
    const arr = o as unknown[]
    const items: string[] = []
    let holes = 0
    const flush = () => {
      if (holes) items.push(`<${holes} empty item${holes > 1 ? 's' : ''}>`)
      holes = 0
    }
    for (let i = 0; i < arr.length; i++) {
      if (!(i in arr)) {
        holes++
        continue
      }
      flush()
      items.push(inner(arr[i], seen, depth + 1))
    }
    flush()
    items.push(...props(o, seen, depth, true))
    const name = ctorName(o)
    return braces(name && name !== 'Array' ? `${name}(${arr.length})` : '', items, '[', ']')
  }
  if (t === 'Map') {
    const items = [...(o as Map<unknown, unknown>)].map(([k, val]) => `${inner(k, seen, depth + 1)} => ${inner(val, seen, depth + 1)}`)
    return braces(`Map(${(o as Map<unknown, unknown>).size})`, items)
  }
  if (t === 'Set') {
    const items = [...(o as Set<unknown>)].map((x) => inner(x, seen, depth + 1))
    return braces(`Set(${(o as Set<unknown>).size})`, items)
  }
  if (ArrayBuffer.isView(o) && !(t === 'DataView')) {
    const arr = Array.from(o as unknown as ArrayLike<number>)
    return braces(`${t}(${arr.length})`, arr.map((x) => inner(x, seen, depth + 1)), '[', ']')
  }

  const name = ctorName(o)
  const prefix = name === null ? '[Object: null prototype]' : name === 'Object' ? '' : name || t
  return braces(prefix, props(o, seen, depth))
}

/** Une valeur ; `nested` = guillemets autour des chaînes (comme dans un tableau). */
export function formatValue(v: unknown, nested = false): string {
  if (typeof v === 'string' && !nested) return v
  return inner(v, [], 0)
}

/** `%j` comme Node : structure circulaire → '[Circular]', toute autre erreur (BigInt…) est relancée. */
function json(a: unknown): string {
  try {
    return String(JSON.stringify(a))
  } catch (e) {
    if (/circular/i.test(String((e as Error)?.message))) return '[Circular]'
    throw e
  }
}

/** Arguments d'un console.log : premier argument chaîne avec %s %d %i %f %o %O %j %%, puis le reste séparé par des espaces. */
export function formatArgs(args: unknown[]): string {
  const rest = [...args]
  const parts: string[] = []
  if (typeof rest[0] === 'string' && rest[0].includes('%') && rest.length > 1) {
    const fmt = rest.shift() as string
    parts.push(
      fmt.replace(/%([sdifoOjc%])/g, (m, c: string) => {
        if (c === '%') return '%'
        if (!rest.length) return m
        const a = rest.shift()
        switch (c) {
          case 's':
            return typeof a === 'string' ? a : formatValue(a, true)
          case 'd':
          case 'i': {
            if (typeof a === 'bigint') return `${a}n`
            const n = Number(a)
            return String(c === 'i' ? Math.trunc(n) : n)
          }
          case 'f':
            return String(Number(a))
          case 'j':
            return json(a)
          case 'c':
            return ''
          default:
            return formatValue(a, true)
        }
      }),
    )
  }
  for (const a of rest) parts.push(formatValue(a))
  return parts.join(' ')
}
