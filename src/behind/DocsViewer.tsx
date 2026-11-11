import { useState } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DOCS, type DocId } from './docs';

// A doc is "empty" until it has more than its title and a placeholder line.
const isEmpty = (md: string) => md.replace(/^#.*$/m, '').replace(/_To be written\._/g, '').trim().length === 0;

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
export function DocPanel({ id }: { id: DocId }) {
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

export function DocsViewer({ initial = 'concept' }: { initial?: DocId }) {
  const [current, setCurrent] = useState<DocId>(initial);
  return (
    <div className="grid min-h-full grid-cols-[220px_1fr]">
      <nav className="border-r border-line bg-white px-3 py-8" aria-label="Docs">
        <p className="px-3 text-caption font-bold tracking-wide text-muted uppercase">Docs</p>
        <ul className="mt-3 space-y-1">
          {DOCS.map((d) => {
            const empty = isEmpty(d.body);
            const active = d.id === current;
            return (
              <li key={d.id}>
                <button
                  onClick={() => setCurrent(d.id)}
                  className={`flex w-full items-center justify-between rounded-pill px-3 py-2 text-left text-sm ${
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
      <div className="bg-white px-12 py-10">
        <DocPanel id={current} />
      </div>
    </div>
  );
}
