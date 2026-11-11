// Block directives in the docs' markdown: a line of its own like `::screen[trade-in/B]` or `::milestones`.

export type Segment = { kind: 'md'; text: string } | { kind: 'embed'; name: string; arg: string; raw: string };

const DIRECTIVE = /^::([a-z][\w-]*)(?:\[([^\]]*)\])?\s*$/;

/** Splits markdown on directive lines (outside fenced code), keeping everything else as markdown. */
export function splitDirectives(md: string): Segment[] {
  const out: Segment[] = [];
  let buf: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    if (buf.join('').trim()) out.push({ kind: 'md', text: buf.join('\n') });
    buf = [];
  };
  for (const line of md.split('\n')) {
    const f = line.match(/^\s*(```|~~~)/);
    if (f) fence = fence === null ? f[1] : fence === f[1] ? null : fence;
    const d = fence === null ? line.trim().match(DIRECTIVE) : null;
    if (d) {
      flush();
      out.push({ kind: 'embed', name: d[1], arg: (d[2] ?? '').trim(), raw: line.trim() });
    } else buf.push(line);
  }
  flush();
  return out;
}
