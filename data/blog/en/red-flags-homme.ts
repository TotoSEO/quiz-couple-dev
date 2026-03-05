import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'red-flags-in-a-man',
  title: "Red flags in a man: what your gut is trying to tell you",
  metaTitle: "Red Flags in a Man: The Complete List",
  metaDescription: "Something feels off but you can't quite name it? Emotional, behavioural, relationship red flags — the complete list to help you see things clearly.",
  featuredImage: '',
  featuredImageAlt: "Red flags in a man — complete list of warning signs in a relationship",
  publishedAt: '2026-03-05',
  author: AUTHORS['lucie-courtin'],
  excerpt: "Red flags are rarely loud alarm bells. They're patterns you brush off until the day you realise you've been normalising them for months.",
  introduction: `<p>You feel something. A vague discomfort, a tension you can't name, a quiet voice that keeps coming back — and that you keep silencing because "maybe you're overreacting". <strong>You're probably not.</strong></p>
<p>Red flags in a man are rarely loud alarm bells. They're patterns. Things that keep coming up. Behaviours you brush off once, twice, ten times — until the day you realise you've been normalising them for months. This article is here to name them.</p>`,
  quickSummary: [
    "Emotional red flags: he dismisses your feelings, makes you responsible for his moods, runs hot and cold.",
    "Behavioural red flags: his actions don't match his words, he gradually tests your limits.",
    "In public he's perfect. In private, it's a different story.",
    "Relationship red flags are the hardest to spot: gradual isolation, impossible conversations, erosion of your self-confidence.",
    "One or two points aren't enough — repetition and lack of self-reflection are what make a real red flag.",
  ],
  sections: [
    {
      id: 'red-flags-at-a-glance',
      title: "Red flags at a glance",
      content: `<div><table><thead><tr><th>The signal</th><th>What it often means</th><th>Alert level</th></tr></thead><tbody>
<tr><td>He dismisses your feelings</td><td>Your emotions inconvenience him. He'd rather you stay quiet.</td><td>Serious</td></tr>
<tr><td>Everything is always your fault</td><td>He never questions himself. Ever.</td><td>Serious</td></tr>
<tr><td>He isolates you from your people</td><td>Gradual isolation, often disguised as affectionate jealousy.</td><td>Very serious</td></tr>
<tr><td>He runs hot and cold</td><td>Emotional instability or deliberate manipulation.</td><td>Watch closely</td></tr>
<tr><td>His actions don't match his words</td><td>He says the right things. He does what he wants.</td><td>Watch closely</td></tr>
<tr><td>He makes you feel guilty for his moods</td><td>Emotional responsibility dumped on you.</td><td>Serious</td></tr>
<tr><td>All his exes were "crazy"</td><td>In his story, he's never wrong. Never.</td><td>Watch closely</td></tr>
<tr><td>He doesn't respect your boundaries</td><td>He tests how far he can go. Then keeps going.</td><td>Serious</td></tr>
<tr><td>Charming in public, different in private</td><td>Two versions. One for others, one for you.</td><td>Very serious</td></tr>
<tr><td>He takes up space without leaving any</td><td>His needs always come first. Yours come after.</td><td>Watch closely</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'emotional-red-flags',
      title: "Emotional red flags",
      content: `<p>This is usually where it starts. Not with something spectacular, but with a way of interacting that regularly leaves you feeling strange. Exhausted, confused, or with a vague sense that you're "too much".</p>`,
      subsections: [
        {
          id: 'dismisses-your-feelings',
          title: "He dismisses what you feel",
          content: `<p>You explain something that hurt you. His response: "you're too sensitive", "you're being dramatic", "it was just a joke". When repeated, this pattern is called <strong>gaslighting</strong> — and it works exactly like this: by making you doubt your own perception of reality. The problem is never the behaviour that upset you. The problem is that you dared to have a problem.</p>
<p>A healthy man might not immediately understand why something affected you. But he listens. He doesn't ask you to be quiet.</p>`,
        },
        {
          id: 'his-moods-your-responsibility',
          title: "His moods become your responsibility",
          content: `<p>He comes home in a bad mood, and somehow you're walking on eggshells. You change what you were about to say. You wait until he's "in a better place" before bringing anything up. You organise yourself around his current emotional state.</p>
<p>You manage his emotions. He doesn't manage his own. That's a mental and emotional load you carry alone — and if you say anything about it, you're "always complaining".</p>`,
        },
        {
          id: 'hot-and-cold',
          title: "Hot and cold, on repeat",
          content: `<p>One week he's present, warm, attentive. The next, distant and cold with no explanation. And you spend your time trying to figure out what you did to trigger the change. Spoiler: you didn't do anything. He's the one creating this instability, consciously or not. But the result is the same — you walk on eggshells, you constantly seek his approval, you feel relieved when he comes back in "hot" mode. That's the anxious attachment cycle he creates. And once you're in it, getting out is hard.</p>`,
        },
        {
          id: 'never-apologises',
          title: "He never actually apologises",
          content: `<p>Or he does it in a way that turns the blame back on you: "I'm sorry you took it that way", "I'm sorry but you should have...". That's not an apology. It's a polite counter-attack. A real apology doesn't contain a "but".</p>`,
        },
      ],
    },
    {
      id: 'behavioural-red-flags',
      title: "Behavioural red flags",
      content: `<p>These ones are more visible — if you know what to look for. Not necessarily violent or dramatic acts. Often small, repeated behaviours that seem harmless in isolation. But patterns don't lie.</p>`,
      subsections: [
        {
          id: 'actions-vs-words',
          title: "His actions don't match his words",
          content: `<p>He says you matter to him, but he consistently cancels. He says you're important, but he disappears when you need him. He says he'll change, and nothing changes. <strong>Watch what he does, not what he says.</strong> Words cost nothing. Actions reveal real priorities.</p>`,
        },
        {
          id: 'doesnt-respect-boundaries',
          title: "He doesn't respect what you've clearly told him",
          content: `<p>You set a boundary. You expressed it clearly, calmly, without ambiguity. He crossed it anyway. Maybe once, maybe regularly, maybe by minimising it ("why are you being so difficult"). Boundaries aren't suggestions. A man who doesn't respect them doesn't respect you.</p>`,
        },
        {
          id: 'exes-all-crazy',
          title: "He talks about all his exes like they were crazy",
          content: `<p>One difficult ex happens. All his exes were "unstable", "jealous", "clingy", "insane"? At some point, the only constant in the equation is him. That doesn't mean he's necessarily wrong about everything — but someone who takes zero responsibility for past relationships won't behave differently with you.</p>`,
        },
        {
          id: 'gradually-tests-limits',
          title: "He gradually tests your limits",
          content: `<p>It starts small. A little comment about how you dress. A dig at one of your friends. A question about who you were with yesterday. Each time you don't react, it goes one step further. It's rarely brutal at the start — it's gradual, almost imperceptible. And by the time you realise how far it's gone, the line has been moving for a long time.</p>`,
        },
        {
          id: 'two-personalities',
          title: "Two personalities: one in public, one with you",
          content: `<p>Everyone loves him. Charming, funny, considerate with others. With you, he's critical, cold, or controlling. That gap isn't incidental. It means he knows how to control himself — he's choosing not to with you. That's not spontaneity. That's contempt.</p>`,
        },
      ],
    },
    {
      id: 'relationship-dynamic-red-flags',
      title: "Red flags in the relationship dynamic",
      content: `<p>These are the hardest to identify because they involve relational patterns, not isolated acts. You can only see them by stepping back from the whole relationship, not a single episode.</p>`,
      subsections: [
        {
          id: 'takes-up-space',
          title: "He takes up space without leaving any",
          content: `<p>His plans, his moods, his needs, his wants — they structure the relationship. Yours come second, and if you say anything, you're "selfish" or "never satisfied". Over time, you do fewer and fewer things for yourself. You feel yourself disappearing. That's not a feeling.</p>`,
        },
        {
          id: 'cant-talk-to-him',
          title: "You can't talk to him about what bothers you",
          content: `<p>Every attempt at a conversation either escalates into an argument where he comes out on top, stretches into a silence that lasts days, or flips into a situation where you end up apologising for something you didn't do. The result: you avoid important conversations. You swallow it. It builds up. And he never knows anything — because you've learned that telling him doesn't help.</p>`,
        },
        {
          id: 'pulls-you-away',
          title: "He gradually pulls you away from your people",
          content: `<p>It can look like affectionate jealousy at first. "I just love being with you, I wish you'd stayed." But it turns into comments about your friends, tension every time you spend time without him, quiet guilt-tripping. A few months later: you go out less, you see people you loved seeing less, you've isolated yourself. And he's become your main source of social connection. That's exactly where he wanted things to end up.</p>`,
        },
        {
          id: 'doubting-yourself',
          title: "You've doubted yourself since being with him",
          content: `<p>This might be the most telling signal. You were confident before. You knew what you wanted, what you were worth. Now you spend time wondering if you're "too much" this or "not enough" that, whether you're reacting normally, whether you're being reasonable. That erosion of self-esteem doesn't happen by accident. It's built, comment by comment, dismissal by dismissal.</p>`,
        },
      ],
    },
    {
      id: 'now-what',
      title: "You recognised several of these. Now what?",
      content: `<p>First: the fact that you're reading this matters. Something in you was looking for confirmation, a vocabulary, a framework. That's already movement.</p>
<p>One or two points on a list don't automatically make someone a bad partner. Everyone has blind spots, behaviours to work on, rough patches. <strong>What separates a red flag from an ordinary problem is repetition and the absence of self-reflection.</strong> Does he acknowledge the problem when you point it out? Does he make real efforts, or visible ones just long enough for you to calm down? Do things actually change, or do you live in permanent anticipation of a change that never comes?</p>
<p>If you're ticking several boxes and the honest answer to those questions is "no" — trust what you feel. Your instinct brought you here. It deserves to be heard.</p>`,
    },
  ],
};

export default article;
