import { useState } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DOCS, isEmptyDoc, type DocId } from './docs';

const isEmpty = isEmptyDoc;

const md: Components = {
  h1: ({ children }) => <h1 className="text-h3 font-bold text-ink">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-12 border-t border-line pt-8 text-h4 font-bold text-ink">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 text-title font-bold text-ink">{children}</h3>,
  p: ({ children }) => <p className="mt-4 text-base leading-[28px] text-body">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-[28px] text-body marker:text-subtle">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-3 pl-6 text-base leading-[28px] text-body marker:font-bold marker:text-ink">{children}</ol>,
  li: ({ children }) => <li className="pl-1 [&>p]:mt-0">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
  em: ({ children }) => <em className="text-ink italic">{children}</em>,
  a: ({ children, href }) => (
    <a href={href} className="text-ink underline decoration-subtle underline-offset-2 hover:decoration-ink">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="mt-4 border-l-2 border-ink pl-4 text-muted">{children}</blockquote>,
  code: ({ children }) => <code className="rounded-xs bg-line-light px-1.5 py-0.5 font-mono text-[0.875em] text-ink">{children}</code>,
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

export function DocBody({ body }: { body: string }) {
  return (
    <article className="max-w-[720px]">
      <Markdown remarkPlugins={[remarkGfm]} components={md}>
        {body}
      </Markdown>
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

interface Props {
  /** Doc open on first render (uncontrolled). */
  initial?: DocId;
  /** Controlled selection, e.g. set by the shell when a Process step's "Read" chip is clicked. */
  selected?: DocId;
  onSelect?: (id: DocId) => void;
}

/** Docs: the repo's documents with a list on the left (on top below 1024px). */
export function DocsViewer({ initial = 'concept', selected, onSelect }: Props) {
  const [own, setOwn] = useState<DocId>(initial);
  const current = selected ?? own;
  const pick = (id: DocId) => {
    setOwn(id);
    onSelect?.(id);
  };
  return (
    <div className="grid min-h-full flex-1 lg:grid-cols-[220px_1fr]">
      <nav className="border-b border-line bg-white px-6 py-4 lg:border-r lg:border-b-0 lg:px-3 lg:py-8" aria-label="Docs">
        <p className="hidden px-3 text-caption font-bold tracking-wide text-muted uppercase lg:block">Docs</p>
        <ul className="flex flex-wrap gap-1 lg:mt-3 lg:block lg:space-y-1">
          {DOCS.map((d) => {
            const empty = isEmpty(d.body);
            const active = d.id === current;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => pick(d.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full items-center justify-between gap-2 rounded-pill px-3 py-2 text-left text-sm whitespace-nowrap ${
                    active ? 'bg-ink font-medium text-white' : empty ? 'text-subtle hover:bg-canvas' : 'text-ink hover:bg-canvas'
                  }`}
                >
                  {d.label}
                  {empty && !active && <span className="text-caption">soon</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0 bg-white px-6 py-8 lg:px-12 lg:py-10">
        <DocPanel id={current} />
      </div>
    </div>
  );
}
