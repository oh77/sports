/**
 * Shapes embedded in the hockeyallsvenskan.se page payload (Strapi CMS
 * records rendered through Next.js RSC). Only the fields we read are typed.
 */

export interface HaMediaFormat {
  url: string;
  width: number;
  height: number;
}

export interface HaLogo {
  url: string;
  formats?: Partial<Record<'small' | 'thumbnail', HaMediaFormat>>;
}

export interface HaTeam {
  name: string;
  shortName: string;
  logo: HaLogo | null;
}

export interface HaGame {
  documentId: string;
  statNetGameNumber: string;
  round: string;
  scheduledDateTime: string;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeOtScore: number | null;
  awayOtScore: number | null;
  homeSoScore: number | null;
  awaySoScore: number | null;
  decidedIn: string | null;
  isCompleted: boolean | null;
  playOffGame: unknown;
  homeStatNetId: string;
  awayStatNetId: string;
  homeTeam: HaTeam;
  awayTeam: HaTeam;
}
