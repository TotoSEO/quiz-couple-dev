import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'pierre-marie-curie-love-story',
  title: "After Pierre died, Marie Curie kept writing to him: the Curies' love story",
  metaTitle: "Pierre and Marie Curie: their love story, from 1894 to the Panthéon",
  metaDescription: "A meeting in 1894, a wedding with no white dress, two bicycles for a honeymoon, radium, then the accident of 1906. The love story of Pierre and Marie Curie.",
  featuredImage: '/blog/pierre-marie-curie-histoire-amour.webp',
  featuredImageAlt: "Pierre and Marie Curie in their laboratory, standing and seated at their instruments, with a colleague on the left",
  publishedAt: '2026-10-23T08:10:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "After Pierre's accident in 1906, Marie Curie kept a diary she wrote directly to him. Here is their story, from their first meeting in 1894 to the Panthéon.",
  introduction: `<p>Most people know Marie Curie for her two Nobel Prizes. Fewer know that she lived <strong>a real love story</strong> with Pierre Curie, one that lasted a little over ten years and ended all at once, in 1906, on a street in Paris.</p>
<p>They did everything together, work included. And when Pierre died, Marie kept talking to him... in a diary she wrote to him.</p>`,
  quickSummary: [
    "Maria Skłodowska and Pierre Curie met in Paris in 1894 and married in July 1895.",
    "No white dress and no rings: a dark blue outfit she later wore in the lab, and two bicycles for the honeymoon.",
    "Together, they discovered polonium and radium in 1898 and won the Nobel Prize in Physics in 1903.",
    "After Pierre died in April 1906, Marie kept a diary addressed to him and took over his course at the Sorbonne.",
  ],
  sections: [
    {
      id: 'how-they-met',
      title: "How Marie and Pierre met",
      content: `<p>In 1891, Maria Skłodowska left Warsaw to study in Paris, at the Sorbonne.</p>
<p>In the spring of 1894, she was looking for a lab for a study on the magnetism of steel. A Polish professor visiting Paris, Józef Kowalski, introduced her to someone who might help: <strong>Pierre Curie, a physicist eight years older than her</strong>, who taught at the Paris School of Industrial Physics and Chemistry.</p>
<p>That summer, Maria went home to Poland for the holidays, without knowing whether she would come back to France. Pierre wrote to her, several times, to convince her to come back and do her doctorate in Paris.</p>
<blockquote><p>"... passer la vie l'un près de l'autre, hypnotisés dans nos rêves : votre rêve patriotique, notre rêve humanitaire et notre rêve scientifique." (... to spend our lives near each other, hypnotized by our dreams: your patriotic dream, our humanitarian dream and our scientific dream.)<br><small>Pierre Curie to Maria Skłodowska, summer 1894</small></p></blockquote>
<p>She came back to Paris in the fall. They got married the following summer.</p>`,
    },
    {
      id: 'a-wedding-with-no-white-dress',
      title: "A wedding with no white dress",
      content: `<p>The wedding took place on July 26, 1895, at the town hall of Sceaux, just outside Paris. <strong>No church, no rings</strong>: a civil wedding, with family and a few friends.</p>
<p>No white dress either. Marie chose a simple dark blue outfit, something she could wear again every day. And that's exactly what she did: she wore it in the lab for years afterwards.</p>
<figure class="blog-portrait"><img src="/blog/pierre-marie-curie-1895.webp" alt="Photograph of Pierre and Marie Curie in 1895, standing side by side, her hand on his arm" width="620" height="826" loading="lazy"><figcaption>Pierre and Marie Curie in 1895, the year they got married.</figcaption></figure>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">🚲 The honeymoon</p>
<p>With the money they received as wedding gifts, they bought <strong>two bicycles</strong>. That was their honeymoon: bike rides along small country roads, in the summer of 1895.</p>
</aside>`,
    },
    {
      id: 'radium-a-discovery-for-two',
      title: "Radium, a discovery made together",
      content: `<p>For her thesis, Marie picked a brand-new subject: the rays given off by uranium, discovered by Henri Becquerel in 1896. Measuring different minerals, she noticed that some gave off far more than uranium alone could explain. So there had to be something else in them.</p>
<p>Pierre found the lead so promising that he <strong>set his own research aside</strong>, on crystals, to work with her. In 1898, they announced two new elements: polonium in July, named after Marie's native Poland, then radium in December.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">The Curies in numbers</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">11</span>years of marriage, or almost</li>
<li><span class="blog-chiffres-nombre">2</span>elements discovered together in 1898</li>
<li><span class="blog-chiffres-nombre">5</span>Nobel Prizes in the Curie family</li>
<li><span class="blog-chiffres-nombre">1st</span>woman professor at the Sorbonne: Marie, in 1908</li>
</ul>
</div>
<p>In the meantime, their first daughter, Irène, was born in September 1897. They worked in a damp shed at the School of Physics and Chemistry, and Marie later talked about the very happy working days they spent there, in spite of everything.</p>`,
    },
    {
      id: 'the-1903-nobel-prize',
      title: "The 1903 Nobel Prize, and Pierre stepping in",
      content: `<p>In 1903, the French scientists who put names forward for the Nobel Prize in Physics nominated Henri Becquerel and Pierre Curie. <strong>Marie wasn't on the list.</strong></p>
<p>Pierre heard about it from a member of the Swedish Academy, and he wrote back: if he was being considered for the prize, he wanted it to be together with Madame Curie, for their joint research. In the end she was awarded the prize with them, and became the <strong>first woman to win a Nobel Prize</strong>.</p>
<p>That says a lot about their relationship. Pierre <a href="/en/healthy-relationship-test/">treated her as an equal</a>, at a time when a woman scientist was easily taken for her husband's assistant.</p>`,
    },
    {
      id: 'april-19-1906',
      title: "April 19, 1906",
      content: `<p>That Thursday, it was pouring with rain in Paris. Pierre was hurrying across a street near the Pont-Neuf when he was run over by a <strong>horse-drawn wagon</strong> loaded with military uniforms. He was killed instantly. He was 46.</p>
<p>Marie was 38, with two daughters: Irène, 8, and Ève, 16 months old.</p>
<p>Eleven days later, she started a <strong>diary written directly to Pierre</strong>, addressing him as "tu", the way you speak to someone close. In it, she wrote that she had slipped a photo of herself into his coffin: the picture of the woman he had chosen as his companion. Then she told him about her days, what people were offering her, what she felt. In May, she wrote to him that she had been offered his chair at the Sorbonne, and that she no longer loved the sun or the flowers.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💡 Good to know</p>
<p>On November 5, 1906, Marie gave her first lecture at the Sorbonne, in Pierre's place. The hall was packed with onlookers and journalists, all expecting a tribute to Pierre. <strong>She made no speech</strong>: she went straight into her lecture, on the progress made in physics over the previous ten years. Two years later, she became the first woman appointed professor at the Sorbonne.</p>
</aside>`,
    },
    {
      id: 'together-in-the-pantheon',
      title: "Together in the Panthéon",
      content: `<p>In 1911, Marie won a second Nobel Prize on her own, this time in chemistry. She died in 1934 and was buried in Sceaux, next to Pierre.</p>
<p>In 1995, their remains were moved together to the Panthéon in Paris. Marie was <strong>the first woman to be buried there for her own achievements</strong>.</p>
<p>Their daughter Irène followed the same path, by the way. With her husband, Frédéric Joliot, she won the Nobel Prize in Chemistry in 1935. Another couple of researchers!</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💌 And today?</p>
<p>No need to discover a chemical element for this: plenty of couples found each other through <a href="/en/couple-common-points-test/">a shared passion</a>, and keep it as a space that belongs only to them.</p>
</aside>
<a href="/en/blog/marie-antoinette-fersen-letters/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Read also</span><span class="blog-read-also-title">Marie Antoinette and Fersen: their censored letters read with X-rays</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<a href="/en/blog/juliette-drouet-victor-hugo-letters/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Read also</span><span class="blog-read-also-title">Juliette Drouet and Victor Hugo: 50 years of love and 22,000 letters</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<p class="blog-sources"><strong>Sources:</strong> Institut Curie, pages on the history of Pierre and Marie Curie (<a href="https://curie.fr/" rel="noopener" target="_blank">curie.fr</a>, in French); American Institute of Physics, "Marie Curie and the Science of Radioactivity" (<a href="https://history.aip.org/exhibits/curie/" rel="noopener" target="_blank">see the exhibit</a>); PSL University, virtual exhibition "Marie Curie, 1867-1934" (<a href="https://explore.psl.eu/en/discover/virtual-exhibits/marie-curie-1867-1934/trials-tribulations-and-consecration-1906-1919" rel="noopener" target="_blank">explore.psl.eu</a>).</p>
<p class="blog-sources"><strong>Images:</strong> Pierre and Marie Curie in their laboratory, photograph, Wellcome Collection, CC BY 4.0, cropped; Pierre and Marie Curie in 1895, photograph, public domain.</p>`,
    },
  ],
};

export default article;
