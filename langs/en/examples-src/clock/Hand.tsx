import { Component, splitProps } from 'solid-js';

type HandProps = { rotate: string; class: string; length: number; width: number; fixed?: boolean };

export const Hand: Component<HandProps> = (props) => {
  const [local, rest] = splitProps(props, ['rotate', 'length', 'width', 'fixed']);
  return (
    <line
      y1={local.fixed ? local.length - 95 : undefined}
      y2={-(local.fixed ? 95 : local.length)}
      stroke="currentColor"
      stroke-width={local.width}
      stroke-linecap="round"
      transform={local.rotate}
      {...rest}
    />
  );
};
