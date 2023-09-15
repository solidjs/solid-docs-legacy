import { createSignal, onCleanup } from 'solid-js';
import { Hand } from './Hand';
import { Lines } from './Lines';
import { createAnimationLoop } from './utils';
import type { Accessor, Component } from 'solid-js';

const getSecondsSinceMidnight = (): number => (Date.now() - new Date().setHours(0, 0, 0, 0)) / 1000;

type ClockFaceProps = {
  hour: string;
  minute: string;
  second: string;
  subsecond: string;
};

export const ClockFace: Component<ClockFaceProps> = (props) => (
  <svg viewBox="0 0 200 200" width="95vh">
    <g transform="translate(100, 100)">
      {/* static */}
      <circle class="text-neutral-900" r="99" fill="white" stroke="currentColor" />
      <Lines numberOfLines={60} class="subsecond" length={2} width={1} />
      <Lines numberOfLines={12} class="hour" length={5} width={2} />
      {/* dynamic */}
      <Hand rotate={props.subsecond} class="subsecond" length={85} width={5} />
      <Hand rotate={props.hour} class="hour" length={50} width={4} />
      <Hand rotate={props.minute} class="minute" length={70} width={3} />
      <Hand rotate={props.second} class="second" length={80} width={2} />
    </g>
  </svg>
);

export const Clock: Component = () => {
  const [time, setTime] = createSignal<number>(getSecondsSinceMidnight());
  const dispose = createAnimationLoop(() => {
    setTime(getSecondsSinceMidnight());
  });
  onCleanup(dispose);

  const rotate = (rotate: number, fixed: number = 1) => `rotate(${(rotate * 360).toFixed(fixed)})`;

  const subsecond = () => rotate(time() % 1);
  const second = () => rotate((time() % 60) / 60);
  const minute = () => rotate(((time() / 60) % 60) / 60);
  const hour = () => rotate(((time() / 60 / 60) % 12) / 12);

  return (
    <div class="clock">
      <ClockFace hour={hour()} minute={minute()} second={second()} subsecond={subsecond()} />
    </div>
  );
};
