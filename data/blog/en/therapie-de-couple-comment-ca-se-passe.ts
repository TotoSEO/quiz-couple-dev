import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "what-happens-in-couples-therapy",
  title: "What happens in couples therapy? From the first call to the last session",
  metaTitle: "What Happens in Couples Therapy: Session by Session",
  metaDescription: "What happens in couples therapy: the first appointment, what the therapist asks, how often you go, the exercises between sessions, and how it ends.",
  featuredImage: "/blog/therapie-de-couple-comment-ca-se-passe.webp",
  featuredImageAlt: "The two Quiz Couple characters sitting side by side on a sofa, an hourglass and an open notebook on the coffee table in front of them",
  publishedAt: "2026-12-29T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "The first call, the first session, what the therapist asks, how often you come back and how it ends: couples therapy told in order.",
  introduction: `<p>Couples therapy happens in sessions of about an hour, as a pair, facing a therapist who asks questions, stops the arguments when they spiral and gives you things to try between appointments. The first session is mostly for telling your story. The next ones are for changing how you talk to each other.</p>
<p>Here is how it goes, in order, from the first phone call to the day you no longer need to go.</p>`,
  quickSummary: [
    "The first session is for telling your story and what brings you in; the therapist doesn't give an opinion that day.",
    "A session lasts 45 to 90 minutes, roughly every two or three weeks.",
    "The therapist isn't looking for a culprit: they watch how each of you reacts to the other, and they stop the spirals.",
    "Some therapists also see each of you alone once, early on, to hear what doesn't get said in front of the other.",
    "Between sessions, there are exercises. That's where the couple changes, not only in the office.",
    "Therapy lasts three months to a year. It ends when you can do on your own what you were doing in the session.",
  ],
  sections: [
    {
      id: "the-first-call",
      title: "The first call",
      content: `<p>It all starts with a message or a phone call, usually made by whichever of you most wants to go. The therapist generally asks two or three things: how long you've been together, what brings you in one sentence, and whether you're both coming. It takes five minutes. They'll also tell you their fee and how long a session lasts.</p>
<p>One detail that matters: <strong>most therapists want to see the couple together from the very first session</strong>. If you come alone the first time, some consider that you become "their" client and that they can no longer see the couple neutrally. Others are fine with it. Ask on the phone, it avoids misunderstandings.</p>
<p>If you don't know who to turn to, the <a href="/en/blog/couples-therapy/">guide to couples therapy</a> explains the difference between a psychologist, a licensed therapist and a relationship counsellor, and what to look at before booking.</p>`,
    },
    {
      id: "the-first-session",
      title: "The first session: you tell the story",
      content: `<p>You're sitting side by side, or in two chairs turned towards the therapist. They almost always begin with the same question: "What brings you here?" And then one of two things happens. Either one of you talks for ten minutes while the other stays silent, or you cut each other off after thirty seconds. In both cases, the therapist is already learning a lot about you.</p>
<p>Then they go back in time. How you met, what you liked about each other, when it started to go wrong. <strong>That's not curiosity:</strong> a couple who tells the story of how they met with a smile isn't in the same place as a couple who can't even remember why they got together. Therapists trained in the Gottman method actually do a very structured interview of this kind about the couple's history.</p>
<p>They also ask what each of you expects from therapy. And it happens that the answers aren't the same: one wants to save the relationship, the other wants to "see if it's still possible". The therapist notes it, without judging, because that's often the real starting point.</p>
<p>At the end of this first hour, you haven't solved anything. That's normal. You leave with a second appointment, and often with a small instruction, something like "between now and then, write down the moments when things go well".</p>`,
      tip: "A lot of people are afraid of being \"judged\" in the first session. In practice, the therapist spends the hour listening and asking questions. If they gave their opinion on day one, that would be a rather bad sign.",
    },
    {
      id: "individual-sessions",
      title: "Sometimes, a session each on your own",
      content: `<p>After the first meeting, some therapists see each partner alone, once. It lets them hear what doesn't get said in front of the other: an affair that's still going on, the wish to leave, a fear you're ashamed of.</p>
<p>Two rules almost always apply. First, <strong>what's said in an individual session isn't repeated to the other</strong>. Second, and this is less well known, many therapists refuse to "carry" a secret that would make the therapy impossible, for instance an affair that continues. In that case, they ask the person to say it themselves, or they stop seeing the couple. They announce this from the start, so that everyone knows where they stand.</p>`,
    },
    {
      id: "an-ordinary-session",
      title: "What an ordinary session looks like",
      content: `<p>From the second or third session, the work changes in nature. You often arrive with something that happened during the week, an argument in the car, a family dinner that went badly, and <strong>the therapist has you replay it in slow motion</strong>.</p>
<p>They ask one of you what you felt at the exact moment the other said a particular sentence. They ask the other what they had meant. And there, almost every time, you discover that the two of you weren't in the same scene. She heard "you never do anything", he thought he'd said "I'd have liked some help tonight".</p>
<p>When the discussion slides back into blame, they cut in. Not harshly, but they cut in: "Right now, you're defending yourself. Can you just say back what you understood from what she just said?" Rephrase, wait for the other to confirm, then answer. <strong>It's slow, and that's on purpose.</strong> At home you go a hundred times faster, and that's exactly why it goes off the rails.</p>
<p>Depending on the therapist's approach, the emphasis differs. In emotionally focused therapy, they look for what's underneath the anger, often the fear of no longer mattering to the other, and they walk the couple around that cycle where one pursues and the other withdraws. With the Gottman method, you work more on the concrete way to start a difficult conversation, to make up afterwards, and to show consideration day to day. In both cases, the goal is the same: <strong>that you manage to do this without them</strong>.</p>`,
    },
    {
      id: "how-often",
      title: "How often, and for how long",
      content: `<p>A session lasts between 45 and 90 minutes, longer than an individual session because there are two people to listen to. The usual rhythm is <strong>one session every two or three weeks</strong>: close enough to keep the thread, spaced enough for you to try things in between.</p>
<p>At the start, especially if things are very bad, some suggest a session a week. Towards the end, you space out to once a month, then stop. A complete course of couples therapy is generally between ten and twenty sessions, so three months to a year. What that costs over the whole period is detailed in the article on <a href="/en/blog/couples-therapy-cost/">the cost of couples therapy</a>.</p>
<p>And then there are "as needed" sessions: couples who finished their therapy and come back once, two years later, because one specific subject is stuck. That's common, and rather a good sign.</p>`,
    },
    {
      id: "between-sessions",
      title: "Between sessions: the exercises",
      content: `<p>Almost all therapists give something to do at home. It can be very simple: telling each other every evening one thing you appreciated about the other, taking twenty minutes a day to talk about your day without giving advice, or noting the moments when an argument nearly started and what avoided it.</p>
<p><strong>That's where the couple changes.</strong> An hour every two weeks isn't enough; what counts is what you do the other thirteen days. Couples who do the exercises move forward much faster than those who come "just to talk". And if you feel like starting before you even have an appointment, there are <a href="/en/blog/couples-therapy-exercises/">ten or so couples therapy exercises to do at home</a>, with how to go about them.</p>`,
    },
    {
      id: "how-it-ends",
      title: "How it ends",
      content: `<p>There's no closing ceremony. One day, you arrive at a session with not much to report, because the argument of the week, you settled on your own, using what you've learned. The therapist then suggests spacing out, then stopping, leaving the door open.</p>
<p>There are also therapies that end in a separation. It's not rare, and it's not a failure: a couple that parts while still talking, having understood what didn't work, parts infinitely better than a couple that leaves slamming the door. Some therapists actually support that stage, especially when there are children.</p>
<p>And if you're not at the point of booking yet, if you first want to know where you stand, the site offers <a href="/en/relationship-assessment/" data-bilan-src="article-therapie">a 100-question relationship assessment, each of you on your own phone</a>, which compares your answers point by point. It isn't therapy, but it gives a very precise idea of what you'd have to talk about.</p>
<a href="/en/blog/couples-therapy/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Read also</span><span class="blog-read-also-title">Couples therapy: how it works, what it costs, and where to start</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
