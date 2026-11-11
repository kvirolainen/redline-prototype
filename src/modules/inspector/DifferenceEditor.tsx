import { OptionCard } from '../../components/ui/OptionCard';
import { money } from '../../domain/format';
import type { CheckItem } from './fixtures';
import { PhotoStrip } from './parts';
import type { Answer } from './useRun';

type Different = Extract<Answer, { result: 'different' }>;

/** What Sam fills in when an item differs: what he found, a short note, and at least one photo. */
export function DifferenceEditor({
  item,
  answer,
  onChange,
}: {
  item: CheckItem;
  answer: Different;
  onChange: (patch: Partial<{ finding: number; note: string; photos: number }>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">What did you find?</p>
        {item.findings.map((f, i) => (
          <OptionCard
            key={f.label}
            title={f.label}
            helper={f.adjustment === 0 ? 'Stops the pickup, call ops' : `−${money(-f.adjustment)}`}
            selected={answer.finding === i}
            onClick={() => onChange({ finding: i })}
          />
        ))}
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Note for the dealer</span>
        <textarea
          value={answer.note}
          onChange={(e) => onChange({ note: e.target.value })}
          rows={2}
          placeholder="Where it is and how big"
          className="w-full rounded-card border border-line-light bg-white px-4 py-3 text-base text-ink outline-none placeholder:text-subtle hover:border-body focus:border-ink"
        />
      </label>
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Photo</p>
        <PhotoStrip count={answer.photos} label={item.question} required onAdd={() => onChange({ photos: answer.photos + 1 })} />
      </div>
    </div>
  );
}
