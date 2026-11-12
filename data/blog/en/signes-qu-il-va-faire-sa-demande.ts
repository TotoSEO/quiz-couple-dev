import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "signs-he-is-going-to-propose",
  title: "The 12 signs he's going to propose (and the ones that mean nothing)",
  metaTitle: "Signs He's Going to Propose: The 12 Clues",
  metaDescription: "The signs he's going to propose: your ring size, the saving, your parents, the hidden phone... and the false signs that don't mean anything at all.",
  featuredImage: "/blog/signes-qu-il-va-faire-sa-demande.webp",
  featuredImageAlt: "The pink Quiz Couple character examines the purple character with a magnifying glass, as he hides a ring box behind his back",
  publishedAt: "2027-01-20T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "He's interested in your rings, he's saving, he sees your parents without you: the twelve signs a proposal is in the works, and the false clues that raise hopes for nothing.",
  introduction: `<p>The signs that he's going to propose are often the same: <strong>a sudden curiosity about your jewellery, unexplained saving, a phone he turns face down, and conversations about the future that keep coming back</strong>. Taken one by one, they prove nothing. Together, over a few weeks, they leave little doubt.</p>
<p>Here are the twelve signs that come up most, the false signs that raise hopes for nothing, and what you can do meanwhile, other than watch.</p>`,
  quickSummary: [
    "The surest sign is a practical one: he's trying to find out your ring size, taking an interest in your rings or borrowing one 'for no reason'.",
    "Unexplained saving, the phone turned face down and meetings with your parents without you often go together.",
    "He talks about the future as 'we', and he's stopped changing the subject when marriage comes up.",
    "The false signs: a fancy dinner, a trip or a bouquet aren't clues, they're normal gestures.",
    "If you've been watching for months without seeing anything, the question deserves to be asked out loud, not guessed.",
  ],
  sections: [
    {
      id: "the-12-signs",
      title: "The 12 signs",
      content: `<ol class="blog-liste-reperes">
<li><a href="#your-ring-size">He's after your ring size</a></li>
<li><a href="#your-jewellery">He's interested in your jewellery</a></li>
<li><a href="#he-is-saving">He's saving, without saying what for</a></li>
<li><a href="#the-phone">His phone has become secret</a></li>
<li><a href="#your-parents">He sees your parents, or your best friend, without you</a></li>
<li><a href="#the-future-as-we">He talks about the future as 'we'</a></li>
<li><a href="#other-peoples-weddings">He looks at other people's weddings differently</a></li>
<li><a href="#a-special-place">He wants to go back to a special place</a></li>
<li><a href="#he-is-nervous">He's nervous, for no reason</a></li>
<li><a href="#your-tastes">He asks about your tastes</a></li>
<li><a href="#the-planning">He plans more, and better</a></li>
<li><a href="#he-said-yes">He's said yes to things he kept putting off</a></li>
</ol>`,
    },
    {
      id: "your-ring-size",
      title: "1. He's after your ring size",
      content: `<p>This is the surest sign, because it's practical: to buy a ring, you need a size. He holds your hand more often, compares his fingers to yours, asks 'for a laugh' what your ring size is, or a ring you were wearing disappeared for two days before reappearing. <strong>A man who isn't planning anything never asks himself that question.</strong></p>`,
    },
    {
      id: "your-jewellery",
      title: "2. He's interested in your jewellery",
      content: `<p>He's never noticed an earring in his life, and suddenly he's asking whether you prefer gold or silver, whether you like coloured stones, what you think of a friend's ring. He looks in jewellers' windows, when he used to walk past without seeing them. Sometimes he asks your sister or your best friend, and she's been odd with you ever since.</p>`,
    },
    {
      id: "he-is-saving",
      title: "3. He's saving, without saying what for",
      content: `<p>Fewer nights out, a subscription cancelled, a 'we'll see later' on purchases he'd have made before. If you ask, it's vague: 'I'm putting some aside'. An engagement ring in the US averages around $5,500, and a man planning a proposal thinks about it months ahead. What it really costs, and why the two months' salary rule is an invention, is in the article on <a href="/en/blog/engagement-ring-cost/">how much an engagement ring costs</a>.</p>`,
    },
    {
      id: "the-phone",
      title: "4. His phone has become secret",
      content: `<p>He turns it face down when you walk in, leaves the room for a call, closes a tab quickly. In a relationship that's going well, that's not a sign of cheating: it's a sign of a surprise in preparation. He's talking to the jeweller, to your parents, to his friends who are helping. <strong>The difference from a real secret is that everything else is fine</strong>, and he's more tender than usual, not more distant.</p>`,
      tip: "If the hidden phone comes with distance, irritation and evenings that get longer, it's not a proposal being planned. A man who's about to propose gets closer, he doesn't drift away.",
    },
    {
      id: "your-parents",
      title: "5. He sees your parents, or your best friend, without you",
      content: `<p>A lunch with your dad 'to talk about work', a coffee with your mum, messages with your best friend that nobody mentions. Asking the parents for their blessing is no longer an obligation, but lots of men still do it, because they know it matters to you or to them. And the best friend is the official informant: ring size, style, the place that would make you happy.</p>`,
    },
    {
      id: "the-future-as-we",
      title: "6. He talks about the future as 'we'",
      content: `<p>'When we have a house', 'when we have kids', 'we'll go there for our fiftieth'. And above all, he no longer changes the subject when marriage comes into the conversation. He even asks questions: <a href="/en/what-kind-of-wedding-should-we-have-quiz/">big party or small gathering</a>, church or registry office, what name you'd want. A man who has no intention of marrying avoids those questions; a man planning his proposal collects them.</p>`,
    },
    {
      id: "other-peoples-weddings",
      title: "7. He looks at other people's weddings differently",
      content: `<p>At a friend's wedding, he observes. The ceremony, the proposal story told in the speech, the bride's reaction. He asks what you liked, what you wouldn't have done. He takes notes, in his own way. Before, other people's weddings were mostly an excuse to drink with his mates.</p>`,
    },
    {
      id: "a-special-place",
      title: "8. He wants to go back to a special place",
      content: `<p>The restaurant from your first date, the town of your first holiday, a viewpoint where you were happy. He suggests going back, with unusual insistence, and he's already booked. Going back to where it all started is the proposal idea that comes up most often, and for good reason: it's the one that goes wrong least.</p>`,
    },
    {
      id: "he-is-nervous",
      title: "9. He's nervous, for no reason",
      content: `<p>He's distracted, he forgets things, he sometimes looks at you as if he's about to say something and then doesn't. Before a weekend away or a dinner, he's tense when nothing explains it. <strong>The fear of proposing hits even those who are sure of the answer</strong>, and it shows weeks in advance.</p>`,
    },
    {
      id: "your-tastes",
      title: "10. He asks about your tastes",
      content: `<p>Your favourite season, your dream place, what you think of public proposals, whether you'd like your parents to be there. Questions asked as if by the way, often after a film or a friend's story, to find out what would make you happy. He's planning the proposal that looks like you, and for that he needs information.</p>`,
    },
    {
      id: "the-planning",
      title: "11. He plans more, and better",
      content: `<p>The man who left everything to the last minute is booking restaurants, planning a weekend, taking days off he doesn't explain. He asks whether you're free on a specific date, and insists you don't plan anything. A man with nothing in mind doesn't block out a Saturday two months ahead.</p>`,
    },
    {
      id: "he-said-yes",
      title: "12. He's said yes to things he kept putting off",
      content: `<p>The joint account, the dog, the plan to buy, meeting your extended family. Things he kept putting off and now accepts without discussion. He's projecting himself forward, and marriage is the logical next step. It's the most discreet sign, and perhaps the most telling.</p>`,
    },
    {
      id: "the-false-signs",
      title: "The false signs, which mean nothing",
      content: `<p>A few clues lots of women take for announcements, and which are just normal gestures in a relationship that's going well:</p>
<ul>
<li><strong>A fancy dinner:</strong> sometimes it's a proposal, most of the time it's a dinner.</li>
<li><strong>A bouquet, a present:</strong> he loves you, that's all.</li>
<li><strong>A trip:</strong> people go on holiday without getting engaged. If you're watching for the ring at every dessert, you spoil the trip.</li>
<li><strong>He says 'I love you' more often:</strong> good, but it's not a sign.</li>
<li><strong>He talks about a friend's wedding:</strong> everyone does, it's a topic of conversation.</li>
</ul>
<p>The real sign is the combination: several of the twelve, over a few weeks, in a relationship where everything else is fine.</p>`,
    },
    {
      id: "and-if-nothing-comes",
      title: "And if nothing comes?",
      content: `<p>You've been watching for months, you've read this list ten times, and nothing. Two possibilities. Either he isn't ready, and there are reasons for that, which can be understood and discussed: the article on <a href="/en/blog/he-doesnt-want-to-get-married/">what's behind a man who doesn't want to get married</a> goes through them. Or he's waiting for a sign from you, because he isn't sure you want it either.</p>
<p>In both cases, the answer isn't to watch harder. It's to talk about it, on a calm day: 'do you see yourself married one day?'. Not a proposal, not an ultimatum, a question. The answer will tell you more than all the signs put together. And if you want to check you're at the same point, not just about marriage but about what lies behind it, children, money, where to live, the site offers a <a href="/en/relationship-assessment/" data-bilan-src="article-mariage">relationship assessment of a hundred questions, each on your own phone</a>, whose report compares your answers without anyone having to go first.</p>
<p>And then there's a third option that many people forget: <a href="/en/blog/woman-proposing-to-a-man/">proposing yourself</a>. Nothing stops you, and it's less rare than it used to be.</p>
<a href="/en/blog/marriage-proposal/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Read also</span><span class="blog-read-also-title">Marriage proposal: how to do it, when to do it, and everything that comes after</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
