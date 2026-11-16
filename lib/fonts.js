import { Cormorant_Garamond, Jost, Noto_Sans_Tamil, Noto_Serif_Tamil, Kavivanar } from 'next/font/google';

export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost', display: 'swap' });

export const tamilSans = Noto_Sans_Tamil({ subsets: ['tamil'], weight: ['400', '500', '600'], variable: '--font-tamil-sans', display: 'swap' });

export const tamilSerif = Noto_Serif_Tamil({ subsets: ['tamil'], weight: ['500', '600'], variable: '--font-tamil-serif', display: 'swap', preload: false });

// Decorative Tamil calligraphy — used only for the Tamil headline text in the homepage hero.
export const tamilDeco = Kavivanar({ subsets: ['tamil'], weight: '400', variable: '--font-tamil-deco', display: 'swap' });

export const fontVariables = `${cormorant.variable} ${jost.variable} ${tamilSans.variable} ${tamilSerif.variable} ${tamilDeco.variable}`;
