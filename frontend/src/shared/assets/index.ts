import type { FC, SVGProps } from 'react';
import _ArrowDown from './ArrowDown.svg';
import _ArrowUp from './ArrowUp.svg';
import _Cross from './Cross.svg';
import _Down from './Down.svg';
import _ExclamationMark from './ExclamationMark.svg';
import _Fire from './Fire.svg';
import _Logo from './Logo.svg';
import _Person from './Person.svg';
import _Plane from './Plane.svg';
import _Search from './Search.svg';
import _Star from './Star.svg';
import _Swap from './Swap.svg';
import _Up from './Up.svg';

// vite-plugin-svgr (configured with include:'**/*.svg') transforms all *.svg
// imports into React components at runtime. We cast here so TypeScript consumers
// get the correct FC<SVGProps> type instead of vite/client's `string` fallback.
type SvgComponent = FC<SVGProps<SVGSVGElement>>;

export const ArrowDown = _ArrowDown as unknown as SvgComponent;
export const ArrowUp = _ArrowUp as unknown as SvgComponent;
export const Cross = _Cross as unknown as SvgComponent;
export const Down = _Down as unknown as SvgComponent;
export const ExclamationMark = _ExclamationMark as unknown as SvgComponent;
export const Fire = _Fire as unknown as SvgComponent;
export const Plane = _Plane as unknown as SvgComponent;
export const Logo = _Logo as unknown as SvgComponent;
export const Person = _Person as unknown as SvgComponent;
export const Search = _Search as unknown as SvgComponent;
export const Star = _Star as unknown as SvgComponent;
export const Swap = _Swap as unknown as SvgComponent;
export const Up = _Up as unknown as SvgComponent;
