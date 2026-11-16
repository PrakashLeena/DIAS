import { revalidatePath } from 'next/cache';

/** Purges cached public pages (both languages) after admin content changes. */
export function revalidatePublic() {
  try {
    revalidatePath('/[lang]', 'layout');
    revalidatePath('/sitemap.xml');
  } catch (err) {
    console.warn('[revalidate] failed', err?.message);
  }
}
