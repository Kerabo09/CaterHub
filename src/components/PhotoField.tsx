import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { fileToResizedDataUrl } from '../lib/image';

interface Props {
  label: string;
  hint?: string;
  /** Current photo (a URL or data URL), or '' for none. */
  value: string;
  /** Called with a resized JPEG data URL. May be async (e.g. upload). */
  onSelect: (dataUrl: string) => void | Promise<void>;
  onClear: () => void;
  compact?: boolean;
}

export function PhotoField({ label, hint, value, onSelect, onClear, compact }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(''); setBusy(true);
    try {
      await onSelect(await fileToResizedDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not use that photo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="photo-field">
      <span className="photo-label">{label}</span>
      <div className={`photo-box ${compact ? 'compact' : ''}`}>
        {value ? <img src={value} alt={label} /> : (
          <button type="button" className="photo-empty" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 size={22} className="spin" /> : <ImagePlus size={22} />}
            <span>{busy ? 'Uploading…' : 'Add photo'}</span>
          </button>
        )}
        {value && (
          <div className="photo-actions">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? 'Uploading…' : 'Change'}</button>
            <button type="button" onClick={onClear} aria-label={`Remove ${label}`} disabled={busy}><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      {hint && <span className="field-hint" style={{ margin: '6px 0 0' }}>{hint}</span>}
      {error && <p className="auth-error" role="alert" style={{ marginTop: 8, marginBottom: 0 }}>{error}</p>}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} hidden />
    </div>
  );
}
