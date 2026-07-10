import React, { useRef, useState } from 'react';
import { ChevronsRight, Check, ShoppingBag } from 'lucide-react';

interface SwipeToActionProps {
  /** Текст в состоянии ожидания */
  label?: string;
  /** Текст после успешного свайпа */
  completedLabel?: string;
  /** Срабатывает, когда ручку дотянули до конца */
  onComplete: () => void;
  /** Иконка внутри ручки */
  icon?: React.ReactNode;
  disabled?: boolean;
}

const HANDLE = 52; // размер ручки, px
const PAD = 6;     // внутренний отступ трека, px
const THRESHOLD = 0.85; // доля пути для срабатывания

const SwipeToAction: React.FC<SwipeToActionProps> = ({
  label = 'Проведите вправо',
  completedLabel = 'Готово',
  onComplete,
  icon,
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const start = useRef({ pointerX: 0, value: 0 });
  const [x, setX] = useState(0);
  const [max, setMax] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);

  const computeMax = () => {
    const w = trackRef.current?.clientWidth ?? 0;
    return Math.max(0, w - HANDLE - PAD * 2);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || done) return;
    setMax(computeMax());
    setDragging(true);
    start.current = { pointerX: e.clientX, value: x };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - start.current.pointerX;
    setX(Math.min(Math.max(start.current.value + delta, 0), max));
  };

  const finish = () => {
    if (!dragging) return;
    setDragging(false);
    if (max > 0 && x >= max * THRESHOLD) {
      setX(max);
      setDone(true);
      onComplete();
      window.setTimeout(() => {
        setDone(false);
        setX(0);
      }, 1400);
    } else {
      setX(0);
    }
  };

  const progress = max > 0 ? x / max : 0;

  return (
    <div
      ref={trackRef}
      className={`relative w-full h-16 rounded-full overflow-hidden select-none ${
        disabled ? 'bg-ink-300' : 'bg-ink-900'
      }`}
    >
      {/* Заполнение по мере свайпа */}
      <div
        className="absolute inset-y-0 left-0 bg-white/10 rounded-full pointer-events-none"
        style={{ width: x + HANDLE + PAD * 2 }}
      />

      {/* Подпись */}
      <div
        className="absolute inset-0 flex items-center justify-center gap-2 pl-14 pr-6 text-white font-bold tracking-wide pointer-events-none"
        style={{ opacity: done ? 1 : Math.max(0.15, 1 - progress * 1.3) }}
      >
        {done ? (
          <span>{completedLabel}</span>
        ) : (
          <>
            <ChevronsRight className="w-5 h-5 opacity-70" />
            <span>{label}</span>
          </>
        )}
      </div>

      {/* Ручка */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        className="absolute top-1.5 left-1.5 w-[52px] h-[52px] rounded-full bg-white shadow-md flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${x}px)`,
          transition: dragging ? 'none' : 'transform 0.25s ease',
        }}
      >
        {done ? (
          <Check className="w-6 h-6 text-ink-900" />
        ) : (
          icon ?? <ShoppingBag className="w-6 h-6 text-ink-900" />
        )}
      </div>
    </div>
  );
};

export default SwipeToAction;
