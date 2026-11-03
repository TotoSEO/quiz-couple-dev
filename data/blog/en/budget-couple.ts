import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "couple-budget",
  title: "Couple budget: the simple method for making a budget together, and sticking to it",
  metaTitle: "Couple Budget: Make a Budget Together and Stick to It",
  metaDescription: "Couple budget: the five-step method, an example on $5,000 a month, the 50/30/20 rule, the tools, the emergency fund and the monthly check-in.",
  featuredImage: "/blog/budget-couple.webp",
  featuredImageAlt: "The two Quiz Couple characters in front of a big spreadsheet laid on a table, a calculator and some envelopes",
  publishedAt: "2027-02-27T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "A budget for two takes an hour the first time and twenty minutes a month after that. The five-step method, an example for a couple on $5,000, the 50/30/20 rule, the tools, and what to do when you lend money to your partner.",
  introduction: `<p>A couple budget isn't a table of constraints. <strong>It's knowing where the money goes as a couple, so you no longer have to guess, blame each other or go without for nothing.</strong> Couples who have one argue less about money, not because they have more of it, but because they know what's left.</p>
<p>Here's the five-step method, a worked example for a couple on $5,000 a month, the 50/30/20 rule, the tools that work, the emergency fund, and the check-in that holds it all together.</p>`,
  quickSummary: [
    "Five steps: income, fixed costs, variable costs, savings, and pocket money for each. An hour the first time, twenty minutes a month after that.",
    "The 50/30/20 rule gives an order of magnitude: half for essentials, a third for wants, a fifth for savings. A benchmark, not a law.",
    "Yearly costs (taxes, insurance, holidays, gifts) get divided by twelve and set aside each month: they're what blows budgets up.",
    "An emergency fund of three months of expenses, before any other project, removes the fear that feeds most money arguments.",
    "The budget gets reviewed together, once a month, on a fixed date. A budget you don't look at is just another spreadsheet.",
  ],
  sections: [
    {
      id: "why-a-budget",
      title: "Why a budget for two changes everything",
      content: `<p>Without a budget, every expense is a negotiation. Can we afford this restaurant? Is the holiday reasonable? Why did you buy that? And since nobody knows what's left, each answers on instinct: the saver says no, the spender says yes, and off it goes again.</p>
<p><strong>With a budget, the question changes: you no longer ask "can we?", you look at the line.</strong> There's $140 left in leisure this month, so yes to the restaurant, no to the weekend away. Nobody gave in, nobody forbade anything. The budget decided, and you wrote it together. That's why the guide on <a href="/en/blog/money-and-relationships/">money and relationships</a> calls it the tool that calms everything.</p>`,
    },
    {
      id: "the-method",
      title: "The method in five steps",
      content: `<ol>
<li><strong>Income:</strong> both net salaries, benefits, regular income. Bonuses get spread over twelve months. You get what comes in each month.</li>
<li><strong>Fixed costs:</strong> rent or mortgage, utilities, electricity, internet, phones, insurance, subscriptions, transport, childcare. Everything that falls due the same every month. Take the last three statements: it's quicker than guessing.</li>
<li><strong>Variable costs:</strong> groceries, fuel, going out, clothes, health. Average the last three months, and add a twelfth of everything that falls once a year: taxes, car insurance, holidays, Christmas gifts, the car service. This is the line that blows budgets up, because people forget it.</li>
<li><strong>Savings:</strong> a fixed sum, transferred on payday, before everything else. If it comes "from what's left", nothing is ever left.</li>
<li><strong>Pocket money:</strong> a sum for each of you, the same or proportional to income, in an account of your own, no justification needed. It's the line that makes the spender accept the budget, and it's the one people forget most.</li>
</ol>
<p>If at the end the costs exceed the income, you don't start by cutting the pleasures: you look at the fixed costs. One subscription too many, an insurance policy never renegotiated, a phone plan from five years ago often add up to more than all the coffees of the month.</p>`,
    },
    {
      id: "an-example",
      title: "An example for a couple on $5,000 a month",
      content: `<p>Two people, $2,200 and $2,800 net, renting in a city, no children. Here's what a budget that holds looks like:</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">A month on $5,000, as a couple</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">$2,500</span>of fixed costs: rent and utilities 1,600, energy and internet 200, insurance 200, phones 80, transport 250, subscriptions 60, and 110 set aside for the year's taxes and car insurance</li>
<li><span class="blog-chiffres-nombre">$1,300</span>of variable costs: groceries 650, going out and restaurants 300, clothes and health 150, and 200 set aside each month for holidays</li>
<li><span class="blog-chiffres-nombre">$700</span>of savings, transferred on payday, first towards the emergency fund</li>
<li><span class="blog-chiffres-nombre">$500</span>of pocket money, 220 for one and 280 for the other, in proportion to income, no questions asked</li>
</ul>
</div>
<p>And how each of you feeds those lines is the question of <a href="/en/blog/how-to-split-expenses-as-a-couple/">how to split expenses as a couple</a>: here, proportionally, 44% for one and 56% for the other, through two automatic transfers to the joint account. If you pool everything, the question doesn't arise, and <a href="/en/blog/joint-account-or-separate-accounts/">joint account or separate accounts</a> says which set-up goes with which budget.</p>`,
    },
    {
      id: "the-50-30-20-rule",
      title: "The 50/30/20 rule, to check it's reasonable",
      content: `<p>To check your budget isn't lopsided, a well-known benchmark: <strong>half of income for essentials</strong> (housing, groceries, transport, insurance, health), <strong>thirty percent for wants</strong> (going out, holidays, clothes, subscriptions, pocket money), <strong>twenty percent for savings</strong> and paying off debts.</p>
<p>In the example above, essentials come to about 65%, wants 20% and savings 15%: heavy on housing, like most couples in a city, and it gets corrected by raising savings as soon as a salary moves. It's not a law. A couple with a big rent in a capital will be at 60% essentials, a couple who own their home outright at 40%. What the rule tells you is where to look when it doesn't fit.</p>`,
      tip: "The emergency fund first: three months of expenses, in an account you can access, before any other project. It's what removes the fear that feeds most money arguments, because an unexpected bill is no longer a catastrophe.",
    },
    {
      id: "the-tools",
      title: "The tools: spreadsheet, app or envelopes",
      content: `<ul>
<li><strong>The shared spreadsheet:</strong> one column per month, one row per item, open to both of you on your phones. Free, flexible, and it's what most couples end up using.</li>
<li><strong>The budgeting app:</strong> it reads your accounts and sorts the spending by itself. Handy for seeing where the money goes, less so for deciding together: it shows, it doesn't discuss.</li>
<li><strong>Envelopes:</strong> the old method, in cash or in sub-accounts: one envelope for groceries, one for going out, one for holidays. When the envelope is empty, you stop. It's the method that works best for spenders, because it makes the limit visible.</li>
</ul>
<p>And one point worth all the tools: <strong>the check-in</strong>. Twenty minutes a month, on a fixed date, the first Sunday for instance, with the budget in front of you. You look at what went over, what's coming next month, and each of you says what's on your mind. A budget you don't look at together is just another spreadsheet. The article on <a href="/en/blog/how-to-talk-about-money-with-your-partner/">how to talk about money with your partner</a> explains how to set up that check-in without it becoming a chore.</p>`,
    },
    {
      id: "lending-money-to-your-partner",
      title: "Lending money to your partner",
      content: `<p>It happens in many couples who keep separate accounts: one advances a large sum to the other, for a car, a deposit, a debt from before. And it ends badly more often than you'd think, not because the other doesn't pay it back, but because nobody said whether it was a loan or a gift.</p>
<p>Two rules. The first: <strong>say it, in one sentence, the same day</strong>. "I'm lending you $3,000, pay me back when you can" isn't the same as "I'm helping you out", and both are fine as long as you know which it is. The second, beyond a few hundred dollars and if you're not married: <strong>a piece of paper</strong>, a dated and signed IOU, with the amount and the repayment schedule. It seems cold between two people who love each other. Above all it's what lets you stop thinking about it, and not turn it into an argument in two years. The guide on <a href="/en/blog/money-and-relationships/">money and relationships</a> recalls what the law says, or doesn't say, for unmarried couples.</p>
<p>To find out whether you see saving the same way, an absolute priority for one and "you have to enjoy life" for the other, the <a href="/en/relationship-assessment/" data-bilan-src="article-argent">relationship assessment, done on your own phones</a>, asks each of you the question, along with what you'd do with $1,000 that fell from the sky. The two answers side by side are often the starting point of the first budget.</p>
<a href="/en/blog/money-and-relationships/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Read also</span><span class="blog-read-also-title">Money and relationships: how to manage money as a couple without it ending in a fight</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
