import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "money-and-relationships",
  title: "Money and relationships: how to manage money as a couple without it ending in a fight",
  metaTitle: "Money and Relationships: Managing Money as a Couple",
  metaDescription: "Money and relationships: why couples fight about it most, the three ways to manage money as a couple, splitting expenses, budgeting, and what breaks trust.",
  featuredImage: "/blog/argent-et-couple.webp",
  featuredImageAlt: "The two Quiz Couple characters sitting at a table in front of a piggy bank, some coins and a spreadsheet",
  publishedAt: "2027-02-14T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Money is the argument that weighs most on a couple, and the one couples talk about least. The three ways to manage money as a couple, how to split expenses, talk about it, make a budget, and what breaks trust.",
  introduction: `<p>Money in a relationship isn't about how much you have. Couples who earn little get on fine about it, and comfortable couples tear each other apart over it. <strong>It's about rules: who pays for what, what's ours, what stays each person's own, and how you talk about it.</strong> As long as those rules are unspoken, each of you follows your own, and that's where it goes wrong.</p>
<p>This guide explains why money causes more fights than anything else, describes the three ways couples manage money, and points to eight articles: joint accounts, splitting expenses, how to talk about it, the income gap, the partner who spends too much, arguments, budgeting, and financial infidelity.</p>`,
  quickSummary: [
    "Money disagreements are the strongest predictor of divorce among all topics couples argue about, ahead of chores, in-laws and sex, in a study of more than 4,500 couples followed for five years.",
    "There are three ways to manage money as a couple: everything pooled, a joint account for the couple with the rest kept separate, or fully separate finances. None is the right one, but only one is chosen together.",
    "What causes the fight is almost never the amount: it's what the amount means, power, security, respect for what each person brings.",
    "The rule that avoids the most arguments: a threshold above which you tell the other before buying, and some pocket money nobody checks.",
    "If money has become a weekly fight, it's no longer about method: something else is being fought over on that ground.",
  ],
  sections: [
    {
      id: "the-guide",
      title: "The guide, article by article",
      content: `<p>This page covers the whole subject. Each question also has its own, more detailed article, if you want to go straight to what concerns you:</p>
<ol class="blog-liste-reperes">
<li><a href="/en/blog/joint-account-or-separate-accounts/">Joint account or separate accounts: which to choose</a></li>
<li><a href="/en/blog/how-to-split-expenses-as-a-couple/">How to split expenses as a couple: 50/50 or in proportion to income</a></li>
<li><a href="/en/blog/how-to-talk-about-money-with-your-partner/">How to talk about money with your partner without it going wrong</a></li>
<li><a href="/en/blog/my-partner-earns-more-than-me/">My partner earns more than me: living with the income gap</a></li>
<li><a href="/en/blog/my-partner-spends-too-much/">My partner spends too much, or too little</a></li>
<li><a href="/en/blog/money-arguments-in-relationships/">Money arguments in relationships</a></li>
<li><a href="/en/blog/couple-budget/">Making a budget as a couple</a></li>
<li><a href="/en/blog/financial-infidelity/">Financial infidelity: hiding money from your partner</a></li>
</ol>`,
    },
    {
      id: "why-money-causes-more-fights",
      title: "Why money causes more fights than anything else",
      content: `<p>Couples argue about housework, about in-laws, about time spent together. But money arguments aren't like the others, and that's not just an impression.</p>
<p>In 2012, three American researchers went back to data on more than 4,500 couples interviewed twice, five years apart. They looked at which topics of disagreement at the first interview predicted a divorce by the second. <strong>Money disagreements came first, ahead of housework, in-laws, time together and sex</strong>, for men as for women, whatever the income level. Another study, which had about a hundred couples keep a diary for fifteen days, found that money arguments lasted longer, came back more often and got resolved less than the others.</p>
<p>The reason is that money is never only about money. An unplanned purchase means "you don't respect me". A separate account means "you don't trust me". A lower salary means "I count for less". Behind every number there's security, power, freedom, and what you saw your parents do. That's why you can't settle a money argument with a calculator, and it's the whole subject of the article on <a href="/en/blog/money-arguments-in-relationships/">money arguments in relationships</a>.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Money in relationships, in numbers</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">No. 1</span>money disagreements, the top predictor of divorce among argument topics, across 4,500 couples</li>
<li><span class="blog-chiffres-nombre">4 in 10</span>people with combined finances have hidden a purchase, a debt or an account from their partner, in a US survey</li>
<li><span class="blog-chiffres-nombre">55%</span>of US marriages where the husband is the main earner, against 16% where the wife is, according to Pew Research</li>
<li><span class="blog-chiffres-nombre">2 years</span>of follow-up in an experiment where couples assigned to a joint account kept a better relationship than the others</li>
</ul>
</div>`,
    },
    {
      id: "the-three-ways",
      title: "The three ways to manage money as a couple",
      content: `<p>There aren't thirty-six of them. Every couple in the world is in one of these three boxes, or somewhere between two:</p>
<ul>
<li><strong>Everything pooled:</strong> both salaries land in the same account, and everything comes out of it, rent and coffee alike. It's the choice of most married couples and most couples with children. Simple, united, but every purchase is visible to the other, and the one who earns less can end up feeling watched.</li>
<li><strong>A joint account for the couple, the rest kept separate:</strong> each of you pays a share into an account that covers rent, groceries, children, and keeps a personal account for your own spending. It's the set-up on the rise, especially among people under forty, because it keeps a bit of independence without counting every cent.</li>
<li><strong>Separate finances:</strong> no joint account, you share the bills by taking turns or paying each other back. Common at the start, when you don't live together, and among people who've already been through a separation. It works as long as incomes are close and there are no children.</li>
</ul>
<p>Which one is right? The one you chose together. An experiment on 230 engaged or newly married couples drew lots for who opened a joint account and who kept separate accounts: after two years, <strong>those who had pooled everything said they were more satisfied with their relationship</strong>, while the others had seen their satisfaction drop, as it usually does in the first years. But the effect came less from the account than from what it forces you to do: talk about spending, decide together. All of it is detailed, pros and traps included, in the article on <a href="/en/blog/joint-account-or-separate-accounts/">joint account or separate accounts</a>.</p>`,
    },
    {
      id: "who-pays-for-what",
      title: "Who pays for what: 50/50 or in proportion to income",
      content: `<p>As soon as you don't pool everything, you have to decide how to split. And the reflex is 50/50. It's fair when you both earn the same, and it stops being fair at all when one earns $2,000 and the other $3,500: at the end of the month, the first has nothing left and the second goes away for the weekend.</p>
<p>The most common solution among couples who've thought about it is <strong>splitting in proportion to income</strong>: if you earn 40% of the couple's income, you pay 40% of the shared expenses. Each of you keeps the same share of your own salary. The article on <a href="/en/blog/how-to-split-expenses-as-a-couple/">how to split expenses as a couple</a> does the math step by step, with what goes in the shared pot and what stays out.</p>
<p>And when one earns much more than the other, it's not only a question of math: it's also a question of standing, since the one who pays more quickly ends up deciding more. <a href="/en/blog/my-partner-earns-more-than-me/">My partner earns more than me</a> looks at what that changes, in both directions.</p>`,
      tip: "The rule that avoids the most arguments, according to couples counsellors and to couples themselves: a sum above which you tell the other before buying ($100, $300, up to you), and below it, each of you does what you like without explaining.",
    },
    {
      id: "talk-before-it-blows-up",
      title: "Talk about it before it blows up",
      content: `<p>The problem isn't that couples argue about money. It's that they only talk about it when they're arguing. Between two fights, silence: you don't know what the other earns to the dollar, you don't know what they've put aside, you don't know what worries them.</p>
<p>Most couples who handle it well have one very simple habit: <strong>a time to talk about money, calmly, once a month</strong>. Not when the statement arrives, not the evening of a big purchase. A Sunday, with a coffee, the numbers on the table. What you say in that moment, how to raise an awkward subject, and the questions to ask before moving in together, having a child or buying a home, that's the article on <a href="/en/blog/how-to-talk-about-money-with-your-partner/">how to talk about money with your partner</a>. If you don't know where to start, the <a href="/en/couple-questions/">questions for couples to ask each other</a> have a set on money and the future.</p>
<p>And if one of you spends without counting while the other saves every dollar, the conversation is even more necessary, and more delicate. A study of more than a thousand married people showed that savers tend to marry spenders, and that the wider the gap between the two, the more the couple fights about money. <a href="/en/blog/my-partner-spends-too-much/">My partner spends too much, or too little</a> explains how those two relationships with money can live together.</p>`,
    },
    {
      id: "the-budget",
      title: "The budget, the tool that calms everything",
      content: `<p>People imagine a budget as a constraint. It's the opposite: <strong>a couple who knows where its money goes argues less, because it no longer has to guess</strong>. You no longer wonder whether you can afford a holiday, you look at the holiday line. You no longer blame a purchase, you look at what's left in the leisure line.</p>
<p>Making a budget as a couple takes an hour the first time and twenty minutes a month after that: income, fixed costs, variable costs, savings, and some pocket money for each of you that nobody checks. The method, with a worked example for a couple on $5,000 a month, is in the article on <a href="/en/blog/couple-budget/">the couple budget</a>.</p>`,
    },
    {
      id: "what-breaks-trust",
      title: "What breaks trust",
      content: `<p>There's one thing even couples who manage their money well haven't planned for: lying. A hidden purchase, a debt you didn't mention, an account the other doesn't know exists, money lent to your family without a word. In a US survey, <strong>four in ten people with combined finances admitted having hidden one of these</strong>. It's called financial infidelity, and for the person who finds out, it feels like being cheated on: it isn't the amount that hurts, it's the lie.</p>
<p>What counts as a private corner (a personal account the other knows exists) and what counts as a lie, how you react when you find out, and how you confess when it's you, is the article on <a href="/en/blog/financial-infidelity/">financial infidelity</a>.</p>`,
    },
    {
      id: "what-the-law-says",
      title: "What the law says, in one minute",
      content: `<p>Many couples believe that living together is enough to share. It isn't. It depends on where you live and on your status, but the broad lines are the same in the US and the UK:</p>
<ul>
<li><strong>Married:</strong> what's acquired during the marriage is generally treated as shared when a court divides things up, through community property rules in some US states and a judge's fair division elsewhere and in the UK. What you owned before and what you inherit is often treated differently. A prenup or a postnup changes the rules.</li>
<li><strong>Living together, unmarried:</strong> nothing automatic. There's no such thing as common-law marriage in England and Wales, and only a handful of US states recognise it. Each of you owns what's in your name, and a home bought together belongs to you in the shares written on the deed, not in the shares you actually paid.</li>
<li><strong>A joint account:</strong> binds both of you. If one of you overdraws it, the bank can come after the other, and in the UK it creates a financial link on both your credit files.</li>
</ul>
<p>These rules are worth knowing before you sign a lease together, and the <a href="/en/moving-in-together-test/">test to find out whether you're ready to move in together</a> asks the money question among the others.</p>`,
    },
    {
      id: "where-to-start",
      title: "Where to start",
      content: `<p>If you've never talked about money, don't start with a spreadsheet. Start with a single question, each on your own, then compare: <strong>"For you, ideally, is money in a couple everything pooled, one account for the couple and the rest kept separate, or each person's own?"</strong> Most couples discover they don't have the same answer, and that they'd never asked.</p>
<p>It's one of the hundred questions in the <a href="/en/relationship-assessment/" data-bilan-src="article-argent">relationship assessment, done on your own phones</a>: a whole domain is devoted to money, splitting expenses, saving, buying without telling, helping family, and the report shows question by question where you agree and where you don't, without anyone having had to raise the subject. Many couples find there the money conversation they'd been putting off for years.</p>
<p>And if the subject has already become a weekly argument, it's no longer a question of method. The article on <a href="/en/blog/couples-therapy/">couples therapy</a> explains how a third person helps you out of it, and money is one of the first reasons couples walk through the door.</p>`,
    },
  ],
};

export default article;
