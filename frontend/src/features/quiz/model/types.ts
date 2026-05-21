export type DestinationKey =
  // Cities in DB
  | 'moscow'
  | 'spb'
  | 'sochi'
  | 'kazan'
  | 'ekb'
  | 'novosib'
  | 'krasnodar'
  | 'vladivostok'
  | 'kaliningrad'
  | 'mineralvody'
  | 'ufa'
  | 'irkutsk'
  | 'khabarovsk'
  | 'krasnoyarsk'
  | 'nnov'
  | 'samara'
  | 'omsk'
  | 'perm'
  | 'tyumen'
  | 'murmansk'
  // Iconic regions (not in DB flights but valid destinations)
  | 'karelia'
  | 'altai'
  | 'baikal'
  | 'kamchatka'
  | 'dagestan';

export type AnswerScores = Partial<Record<DestinationKey, number>>;

export interface Answer {
  id: string;
  emoji: string;
  label: string;
  sublabel?: string;
  scores: AnswerScores;
  flashMessage?: string;
}

export interface Question {
  id: string;
  title: string;
  answers: Answer[];
}

export interface Destination {
  key: DestinationKey;
  name: string;
  emoji: string;
  tagline: string;
  descriptions: string[];
}

export type QuizScreen = 'landing' | 'brief' | 'quiz' | 'result';
