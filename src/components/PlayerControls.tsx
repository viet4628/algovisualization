import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

type Props = {
  step: number;
  total: number;
  playing: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onSpeed: (s: number) => void;
};

export function PlayerControls({ step, total, playing, speed, onPlay, onPause, onPrev, onNext, onReset, onSpeed }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <button onClick={onReset} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted" aria-label="Reset">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button onClick={onPrev} disabled={step === 0} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-40" aria-label="Prev">
          <SkipBack className="h-4 w-4" />
        </button>
        {playing ? (
          <button onClick={onPause} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Pause className="h-4 w-4" /> Tạm dừng
          </button>
        ) : (
          <button onClick={onPlay} disabled={step >= total - 1} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40">
            <Play className="h-4 w-4" /> Chạy
          </button>
        )}
        <button onClick={onNext} disabled={step >= total - 1} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-40" aria-label="Next">
          <SkipForward className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>Tốc độ</span>
          <input
            type="range"
            min={0.25}
            max={3}
            step={0.25}
            value={speed}
            onChange={(e) => onSpeed(Number(e.target.value))}
            className="w-28 accent-[oklch(0.32_0.08_255)]"
          />
          <span className="tabular-nums w-8">{speed.toFixed(2)}x</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Bước {step + 1} / {total}</span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(total - 1, 0)}
          value={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            onPause();
            // Caller must handle step jump via separate prop? For simplicity emit through next/prev not used here.
            // We'll jump by simulating: parent uses onSeek by listening to range — see container for direct setStep.
            (onSpeed as unknown as (n: number) => void); // placeholder
            // Fire a custom event via window for simplicity
            window.dispatchEvent(new CustomEvent("__player_seek", { detail: v }));
          }}
          className="w-full accent-[oklch(0.32_0.08_255)]"
        />
      </div>
    </div>
  );
}
