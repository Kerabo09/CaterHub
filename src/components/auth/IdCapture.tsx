import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle2, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
}

const MAX_W = 1280;

/** Live camera capture for an ID photo, with a file fallback when the camera is blocked. */
export function IdCapture({ value, onChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState('');

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setLive(false);
  }, []);

  useEffect(() => stop, [stop]);

  const start = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser can’t open the camera. Use “Upload a photo” instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setLive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setError('Camera access was blocked. Allow the camera in your browser settings, or upload a photo instead.');
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const scale = Math.min(1, MAX_W / v.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(v.videoWidth * scale);
    canvas.height = Math.round(v.videoHeight * scale);
    canvas.getContext('2d')?.drawImage(v, 0, 0, canvas.width, canvas.height);
    onChange(canvas.toDataURL('image/jpeg', 0.85));
    stop();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Choose an image file.'); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_W / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      onChange(canvas.toDataURL('image/jpeg', 0.85));
      URL.revokeObjectURL(url);
      setError('');
    };
    img.src = url;
    e.target.value = '';
  };

  const retake = () => { onChange(''); start(); };

  return (
    <div>
      <div className="idcap-frame">
        {value ? (
          <>
            <img src={value} alt="Captured ID" />
            <span className="idcap-ok"><CheckCircle2 size={14} /> ID captured</span>
          </>
        ) : live ? (
          <>
            <video ref={videoRef} playsInline muted />
            <div className="idcap-guide" aria-hidden="true" />
            <button type="button" className="idcap-x" onClick={stop} aria-label="Close camera"><X size={16} /></button>
          </>
        ) : (
          <div className="idcap-empty">
            <Camera size={26} />
            <p>Take a clear photo of your ID</p>
            <span>Fit all four corners in the frame. Avoid glare.</span>
          </div>
        )}
      </div>

      <div className="idcap-actions">
        {value ? (
          <button type="button" className="btn-secondary" onClick={retake}><RefreshCw size={15} /> Retake photo</button>
        ) : live ? (
          <button type="button" className="btn-primary" onClick={capture}><Camera size={16} /> Capture ID</button>
        ) : (
          <>
            <button type="button" className="btn-primary" onClick={start}><Camera size={16} /> Open camera</button>
            <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}><Upload size={15} /> Upload a photo</button>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} hidden />
      </div>

      {error && <p className="auth-error" role="alert">{error}</p>}
    </div>
  );
}
