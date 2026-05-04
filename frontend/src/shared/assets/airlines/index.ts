import aeroflot from './aeroflot.png';
import pobeda from './pobeda.png';
import rossiya from './rossiya.jpg';
import s7 from './s7.png';
import ural from './ural.png';

type LogoConfig = {
  src: string;
  /** true  → logo already fills a circle (use cover + no padding)
   *  false → logo is on a white background (use contain + padding) */
  circular: boolean;
};

/** Maps FlightDto.airline → logo config */
export const AIRLINE_LOGOS: Record<string, LogoConfig> = {
  'Аэрофлот':            { src: aeroflot, circular: true  },
  'Победа':              { src: pobeda,   circular: false },
  'Россия':              { src: rossiya,  circular: false },
  'Уральские авиалинии': { src: ural,     circular: true  },
  'S7 Airlines':         { src: s7,       circular: true  },
};
