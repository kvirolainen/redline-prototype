import { useMemo, useState } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DOCS, isEmptyDoc, type Doc, type DocId } from './docs';
import { DOCS_TAB_LABEL } from '../shell/views';
import { splitDirectives } from './directives';
import { Embed } from './embeds';

// Images live in docs/img/ and are referenced from the markdown as `img/<file>`.
const IMAGES = import.meta.glob<string>('../../docs/img/*', { eager: true, query: '?url', import: 'default' });
const imageUrl = (src?: string) => {
  if (!src) return undefined;
  const file = src.replace(/^\.?\//, '').replace(/^img\//, '');
  return IMAGES[`../../docs/img/${file}`] ?? src;
};

const isEmpty = isEmptyDoc;

const md: Components = {
  h1: ({ children }) => <h1 className="max-w-[720px] text-h3 font-bold text-ink">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-12 border-t border-line pt-8 text-h4 font-bold text-ink">{children}</h2>,
  h3: ({ children }) => <h3 className="max-w-[720px] mt-8 text-title font-bold text-ink">{children}</h3>,
  p: ({ children }) => <p className="max-w-[720px] mt-4 text-base leading-[28px] text-body">{children}</p>,
  ul: ({ children }) => <ul className="max-w-[720px] mt-4 list-disc space-y-2 pl-6 text-base leading-[28px] text-body marker:text-subtle">{children}</ul>,
  ol: ({ children }) => <ol className="max-w-[720px] mt-4 list-decimal space-y-3 pl-6 text-base leading-[28px] text-body marker:font-bold marker:text-ink">{children}</ol>,
  li: ({ children }) => <li className="pl-1 [&>p]:mt-0">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
  em: ({ children }) => <em className="text-ink italic">{children}</em>,
  a: ({ children, href }) => (
    <a href={href} className="text-ink underline decoration-subtle underline-offset-2 hover:decoration-ink">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="max-w-[720px] mt-4 border-l-2 border-ink pl-4 text-muted">{children}</blockquote>,
  code: ({ children }) => <code className="rounded-xs bg-line-light px-1.5 py-0.5 font-mono text-[0.875em] text-ink">{children}</code>,
  // Markdown wraps a lone image in a paragraph; render that paragraph as a figure so the caption isn't nested in <p>.
  img: ({ src, alt }) => (
    <span className="mt-6 block">
      <img src={imageUrl(typeof src === 'string' ? src : undefined)} alt={alt ?? ''} className="block w-full rounded-card border border-line" loading="lazy" />
      {alt && <span className="mt-2 block text-caption text-muted">{alt}</span>}
    </span>
  ),
  hr: () => <hr className="my-8 border-line" />,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-card border border-line">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-canvas">{children}</thead>,
  th: ({ children }) => <th className="border-b border-line px-4 py-3 text-caption font-bold text-muted uppercase">{children}</th>,
  td: ({ children }) => <td className="border-b border-line-light px-4 py-3 align-top leading-[22px] text-body">{children}</td>,
};

/** A document's markdown, with block directives (`::screen[…]`, `::screens[…]`, `::diagram[…]`, `::milestones`) rendered as embeds. */
export function DocBody({ body }: { body: string }) {
  const segments = useMemo(() => splitDirectives(body), [body]);
  return (
    // Text stays at a readable 720px; tables, images and embeds use the full width (up to 1120px).
    <article className="max-w-[1120px]">
      {segments.map((s, i) =>
        s.kind === 'md' ? (
          <Markdown key={i} remarkPlugins={[remarkGfm]} components={md}>
            {s.text}
          </Markdown>
        ) : (
          <Embed key={i} name={s.name} arg={s.arg} raw={s.raw} />
        ),
      )}
    </article>
  );
}

/** One document: its file path, then the rendered markdown, or "Coming next" while it's still empty. */
function DocPanel({ id }: { id: DocId }) {
  const doc = DOCS.find((d) => d.id === id)!;
  return (
    <>
      <p className="mb-6 font-mono text-caption text-subtle">docs/{doc.file}</p>
      {isEmpty(doc.body) ? (
        <div className="max-w-[720px]">
          <h1 className="text-h3 font-bold text-ink">{doc.label}</h1>
          <div className="mt-6 rounded-panel border border-dashed border-subtle p-8 text-center">
            <p className="text-title font-bold text-ink">Coming next</p>
            <p className="mt-2 text-sm text-muted">This document is written at its step in the process.</p>
          </div>
        </div>
      ) : (
        <DocBody body={doc.body} />
      )}
    </>
  );
}

/** One entry in the list: its number in the process (none for the appendix), label, and "soon" while empty. */
function DocLink({ doc, active, onPick }: { doc: Doc; active: boolean; onPick: (id: DocId) => void }) {
  const empty = isEmpty(doc.body);
  return (
    <button
      type="button"
      onClick={() => onPick(doc.id)}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-2 rounded-pill px-3 py-2 text-left text-sm whitespace-nowrap ${
        active ? 'bg-ink font-medium text-white' : empty ? 'text-subtle hover:bg-canvas' : 'text-ink hover:bg-canvas'
      }`}
    >
      {doc.n !== undefined && <span className={`w-3 shrink-0 text-right text-caption tabular-nums ${active ? 'text-white/70' : 'text-subtle'}`}>{doc.n}</span>}
      <span className="flex-1">{doc.label}</span>
      {empty && !active && <span className="text-caption">soon</span>}
    </button>
  );
}

interface Props {
  /** Doc open on first render (uncontrolled). */
  initial?: DocId;
  /** Controlled selection (the shell keeps it, so the open doc survives switching tabs). */
  selected?: DocId;
  onSelect?: (id: DocId) => void;
}

/** Docs: the repo's documents in process order, numbered, with the decisions log as an appendix.
 *  The list sits on the left (on top below 1024px). */
export function DocsViewer({ initial = 'concept', selected, onSelect }: Props) {
  const [own, setOwn] = useState<DocId>(initial);
  const current = selected ?? own;
  const pick = (id: DocId) => {
    setOwn(id);
    onSelect?.(id);
  };
  return (
    <div className="grid min-h-full flex-1 lg:grid-cols-[220px_1fr]">
      <nav className="border-b border-line bg-white px-6 py-4 lg:border-r lg:border-b-0 lg:px-3 lg:py-8" aria-label={DOCS_TAB_LABEL}>
        <p className="hidden px-3 text-caption font-bold tracking-wide text-muted uppercase lg:block">{DOCS_TAB_LABEL}</p>
        <ul className="flex flex-wrap gap-1 lg:mt-3 lg:block lg:space-y-1">
          {DOCS.map((d) => (
            <li key={d.id} className={d.n === undefined ? 'lg:mt-4 lg:border-t lg:border-line-light lg:pt-4' : undefined}>
              <DocLink doc={d} active={d.id === current} onPick={pick} />
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 bg-white px-6 py-8 lg:px-12 lg:py-10">
        <DocPanel id={current} />
      </div>
    </div>
  );
}
