// The next twelve months. {{venus}}, {{mars}} and {{jupiter}} receive the
// sign the planet is in that month ("in Taurus"). Texts of the same tone take
// turns from one month to the next.
export default {
  mois: {
    titres: {
      tendre: 'A tender month',
      passion: 'A fiery month',
      elan: 'A lucky month',
      malentendus: 'Watch out for misunderstandings',
      turbulences: 'A bumpy month',
      calme: 'A quiet month',
    },
    tendre: [
      "Venus is {{venus}} and softens your sky. It's the right month for sweet words, evenings at home and the little attentions you forget the rest of the year.",
      "With Venus {{venus}}, tenderness is in the air. Make the most of it to treat each other, give a small gift for no reason or pick up a habit you'd lost.",
      "Venus {{venus}} brings you closer. Tensions ease more easily, and it's a good time to make up if something was dragging on.",
      "A gentle month, with Venus {{venus}}. Take time to be together, with no phones, just for the pleasure of it.",
    ],
    passion: [
      "Mars is {{mars}} and sets your sky on fire. Desire rises, and so does energy: it's a month for surprises and sudden urges.",
      "With Mars {{mars}}, the attraction is strong. Use that energy to break out of the routine, and watch out for arguments, which can flare up just as fast.",
      "Mars {{mars}} wakes up your desires. A spur-of-the-moment weekend or an evening out of the ordinary: this month loves boldness.",
      "A fiery month, with Mars {{mars}}. The desire is there, the patience a bit less. Count to ten before answering in anger.",
    ],
    elan: [
      "Jupiter, the planet of luck, is {{jupiter}} and smiles on your charts. It's a good month to start a project together, plan a trip or make a decision you kept putting off.",
      "With Jupiter {{jupiter}}, optimism is on your side. Good news comes more easily, and you feel like thinking big.",
      "Jupiter {{jupiter}} gives you momentum. Talk about your dreams for the future and make plans: this month loves projects.",
    ],
    malentendus: [
      "Mercury goes backward for a good part of the month: in astrology, it's the time of misunderstandings and messages taken the wrong way. Reread before you hit send, and don't make big decisions on a whim.",
      "Mercury retrograde scrambles communication a little. It's a month for coming back to old conversations rather than starting new ones, and for giving each other the benefit of the doubt.",
      "With Mercury going backward, words can come out wrong this month. If a sentence hurts you, ask what the other meant before you react.",
    ],
    turbulences: [
      "The sky is a bit restless for you this month: tiredness and small frictions can take up room. Don't let anything pile up, and keep some calm moments to be together.",
      "A month when your moods may clash. It's not the time for big conversations: go for gentleness, and save the touchy subjects for later.",
      "The planets shake you up a little. Nothing serious, but a bit of patience on both sides will spare you plenty of pointless arguments.",
    ],
    calme: [
      "A quiet month, with not much moving in your sky. Make the most of it to catch your breath, and treat yourselves to a simple moment, just for the pleasure of it.",
      "Nothing special in the sky this month: your relationship moves at its own pace. It's often in months like these that you build the most, without noticing.",
      "A calm month, perfect for the little habits that do you good, like a dinner without screens or a Sunday walk.",
      "The sky leaves you alone this month. No big wave on the horizon: it's the time to take care of your everyday life.",
    ],
    notes: {
      mercure: 'Mercury retrograde from {{du}} to {{au}}',
      venus: 'Venus retrograde from {{du}} to {{au}}',
      mars: 'Mars retrograde from {{du}} to {{au}}',
      anniversaire: "{{p}}'s birthday",
    },
    // Added to the text when the month's planet mostly touches one of you.
    vedette: {
      tendre: "This month, Venus mostly touches {{p}}'s chart.",
      passion: "This month, Mars mostly wakes up {{p}}'s chart.",
      elan: "This month, Jupiter opens doors mostly for {{p}}.",
    },
  },
};
