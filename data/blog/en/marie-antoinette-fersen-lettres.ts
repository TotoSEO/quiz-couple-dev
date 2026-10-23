import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'marie-antoinette-fersen-letters',
  title: "Marie Antoinette and Fersen: what X-rays found under the scribbled-out lines of their letters",
  metaTitle: "Marie Antoinette and Fersen: their censored letters read with X-rays",
  metaDescription: "Parts of the letters between Marie Antoinette and Axel von Fersen were blacked out with ink. Researchers read them with X-rays: here is what they said, and who hid them.",
  featuredImage: '/blog/marie-antoinette-fersen-lettres.webp',
  featuredImageAlt: "Marie Antoinette painted by Élisabeth Vigée Le Brun in 1783, next to Carl Fredrik von Breda's portrait of Axel von Fersen",
  publishedAt: '2026-10-22T16:30:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "For more than a century, whole lines of their letters were unreadable. French researchers read them with X-rays, and we now know who blacked them out.",
  introduction: `<p>During the French Revolution, Marie Antoinette and the Swedish count Axel von Fersen wrote to each other in secret. Part of those letters has been at the French National Archives since 1982, but some words, and sometimes whole lines, are <strong>covered with ink</strong>. For a very long time, nobody could read what was underneath.</p>
<p>In 2021, French researchers managed it with X-rays. Here's what they found.</p>`,
  quickSummary: [
    "Fifteen letters between Marie Antoinette and Fersen, written in 1791 and 1792, have passages blacked out with ink.",
    "In 2021, researchers at the Centre de recherche sur la conservation read eight of them using X-rays.",
    "Under the ink: \"ma tendre amie\" (my dear love), \"vous que j'aime\" (you whom I love), \"non pas sans vous\" (not without you)...",
    "Judging by the ink, Fersen himself most likely blacked out the letters.",
  ],
  sections: [
    {
      id: 'who-was-fersen',
      title: "Who was Axel von Fersen?",
      content: `<p>Axel von Fersen was a Swedish count, born in 1755, the same year as Marie Antoinette.</p>
<p>He met her in 1774 at a masked ball at the Opéra, when they were both 18. She wasn't queen yet. He then became a regular at court, went off to fight in America during the War of Independence, and came back. And in June 1791, <strong>he was the one who organized the royal family's escape</strong>, the one that ended with their arrest at Varennes. He rode with them as far as Bondy, just outside Paris, then let them go on without him.</p>
<p>After Varennes, the king and queen were closely watched at the Tuileries, and Fersen lived mostly in Brussels. They couldn't see each other anymore, <strong>so they wrote</strong>.</p>`,
    },
    {
      id: 'letters-written-in-secret',
      title: "Letters written in secret",
      content: `<p>From late June 1791 to late June 1792, they were very careful: invisible ink (ink you can't see until it's revealed), coded passages... Fersen kept everything. He filed the queen's letters and the drafts of his own, and he copied out some important letters, which was common practice back then. That's why <strong>most of the surviving letters are in his handwriting</strong>, even when the words are Marie Antoinette's.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">The letters in numbers</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">48</span>letters held by the French National Archives since 1982</li>
<li><span class="blog-chiffres-nombre">15</span>with passages covered in ink</li>
<li><span class="blog-chiffres-nombre">8</span>that could be read again in 2021</li>
<li><span class="blog-chiffres-nombre">95</span>days of scanning to get there</li>
</ul>
</div>
<p>The blots cover anything from a few words to a few lines. The letters were published in the 19th century by Fersen's great-nephew, without those passages of course, and ever since, historians had wondered what was underneath.</p>`,
    },
    {
      id: 'reading-under-the-ink',
      title: "How do you read a word under a blot of ink?",
      content: `<p>The work was done by the Centre de recherche sur la conservation (CRC), a French lab run by the National Museum of Natural History, the CNRS and the Ministry of Culture. The study came out in <strong>October 2021 in the journal <em>Science Advances</em></strong>, by Anne Michelin, Fabien Pottier and Christine Andraud.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💡 Good to know</p>
<p>Back then, people wrote with <strong>iron gall ink</strong>, an ink made with iron. But from one bottle to the next, it doesn't contain exactly the same metals: a bit more copper here, a bit more zinc there. The researchers scanned the letters with X-rays, which make each metal "answer" with its own signal. You get a map of the copper, a map of the zinc, and so on, and when the hidden ink contains a metal the blot doesn't, <strong>the words show up again on the map</strong>.</p>
</aside>
<p>It didn't work on every letter. Out of the 15, <strong>7 are still unreadable</strong>: none of the methods brought the text back.</p>`,
    },
    {
      id: 'what-the-ink-was-hiding',
      title: "What the ink was hiding",
      content: `<p>No state secrets: the recovered passages are about love. Here are some of the ones the study published, with the 18th-century French spelling:</p>
<ul>
<li><strong>"ma tendre amie" (my dear love):</strong> Fersen, October 13, 1791.</li>
<li><strong>"vous que j'aime et aimeroi jusqu'a mon..." (you whom I love and will love until my...):</strong> Marie Antoinette, December 7, 1791. The end of the sentence is missing.</li>
<li><strong>"pour le bonheur de tous trois" (for the happiness of all three):</strong> the same letter, a little further on.</li>
<li><strong>"non pas sans vous" (not without you):</strong> Marie Antoinette, January 4, 1792.</li>
</ul>
<p>Anne Michelin, one of the researchers, sums up the vocabulary of the hidden passages in four words: "beloved", "dear friend", "adore", "madly".</p>
<blockquote><p>"sans vous il n'est point de bonheur pour moi l'univers n'est rien sans vous" (without you there is no happiness for me, the universe is nothing without you)<br><small>Axel von Fersen to Marie Antoinette, October 1791</small></p></blockquote>
<p>The extracts the team transcribed point the same way. On September 26, 1791, the queen wrote that she had cried when she heard he planned to spend the winter in Brussels instead of going home to his family. She asked him not to give up seeing his parents for her: <strong>"ceci seroit trop exiger" (that would be asking too much)</strong>.</p>`,
    },
    {
      id: 'who-blacked-out-the-letters',
      title: "Who blacked out the letters?",
      content: `<p>For a long time, the suspect was Fersen's great-nephew, the one who published the letters: he would have wanted to protect the queen's honor, and his family's.</p>
<p>The ink tells a different story. The ink of the blots almost always has the same makeup as Fersen's own ink, the one in his drafts and copies. On one letter, there's even a passage added in his handwriting, right above a blot, in the same ink. According to the researchers, <strong>it really does look like Fersen hid those words himself</strong>.</p>
<p>Why? Nobody knows. It may have been for personal reasons, or political ones: maybe he wanted to be able to use these letters to defend the royal family without damaging the queen's honor, or his own.</p>`,
    },
    {
      id: 'were-they-in-love',
      title: "So, were they in love?",
      content: `<p>That's THE question people have been asking for two centuries. The recovered passages show an <strong>intimate relationship</strong>, something that had never been proven in black and white on Fersen's side. But Anne Michelin stays careful: they "do not allow us to settle once and for all the true nature of their feelings".</p>
<p>Love affair or passionate friendship, everyone will read it their own way. Either way, it was a feeling they had to <a href="/en/does-he-she-secretly-love-me-test/">keep secret</a> until the end. They only saw each other once more, secretly at the Tuileries, in February 1792. Marie Antoinette was guillotined on October 16, 1793.</p>
<p>Fersen never married. He died on June 20, 1810, in Stockholm, killed by a mob during a prince's funeral procession, <strong>nineteen years to the day after the escape to Varennes</strong>.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💌 And today?</p>
<p>Couples who <a href="/en/long-distance-relationship-quiz/">live far apart from each other</a> know that feeling, in a much gentler version: when you can't see each other, everything goes through words, and every message counts a little more than usual.</p>
</aside>
<a href="/en/blog/pierre-marie-curie-love-story/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Read also</span><span class="blog-read-also-title">Pierre and Marie Curie: their love story, from 1894 to the Panthéon</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<a href="/en/blog/juliette-drouet-victor-hugo-letters/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Read also</span><span class="blog-read-also-title">Juliette Drouet and Victor Hugo: 50 years of love and 22,000 letters</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<p class="blog-sources"><strong>Sources:</strong> Anne Michelin, Fabien Pottier and Christine Andraud, "2D macro-XRF to reveal redacted sections of French queen Marie-Antoinette secret correspondence with Swedish count Axel von Fersen", <em>Science Advances</em>, October 2021 (<a href="https://doi.org/10.1126/sciadv.abg4266" rel="noopener" target="_blank">read the study</a>); Anne Michelin, "La correspondance de Marie-Antoinette aux rayons X", <em>The Conversation</em>, January 2022 (<a href="https://theconversation.com/la-correspondance-de-marie-antoinette-aux-rayons-x-173766" rel="noopener" target="_blank">read the article, in French</a>).</p>
<p class="blog-sources"><strong>Image:</strong> <em>Marie Antoinette with a Rose</em>, Élisabeth Vigée Le Brun, 1783, Palace of Versailles; portrait of Axel von Fersen, Carl Fredrik von Breda, around 1800, Östergötland Museum. Public domain.</p>`,
    },
  ],
};

export default article;
