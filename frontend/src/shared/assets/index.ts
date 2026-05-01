import type { FC, SVGProps } from 'react';
import ArrowDownSvg from './ArrowDown.svg';
import ArrowUpSvg from './ArrowUp.svg';
import CrossSvg from './Cross.svg';
import DownSvg from './Down.svg';
import ExclamationMarkSvg from './ExclamationMark.svg';
import FireSvg from './Fire.svg';
import LogoSvg from './Logo.svg';
import PersonSvg from './Person.svg';
import SearchSvg from './Search.svg';
import StarSvg from './Star.svg';
import SwapSvg from './Swap.svg';
import UpSvg from './Up.svg';

type SvgComponent = FC<SVGProps<SVGSVGElement>>;

export const ArrowDown = ArrowDownSvg as unknown as SvgComponent;
export const ArrowUp = ArrowUpSvg as unknown as SvgComponent;
export const Cross = CrossSvg as unknown as SvgComponent;
export const Down = DownSvg as unknown as SvgComponent;
export const ExclamationMark = ExclamationMarkSvg as unknown as SvgComponent;
export const Fire = FireSvg as unknown as SvgComponent;
export const Logo = LogoSvg as unknown as SvgComponent;
export const Person = PersonSvg as unknown as SvgComponent;
export const Search = SearchSvg as unknown as SvgComponent;
export const Star = StarSvg as unknown as SvgComponent;
export const Swap = SwapSvg as unknown as SvgComponent;
export const Up = UpSvg as unknown as SvgComponent;
