import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "haushaltsbudget-fuer-paare",
  title: "Haushaltsbudget für Paare: die einfache Methode, um ein Budget zu zweit aufzustellen und einzuhalten",
  metaTitle: "Haushaltsbudget für Paare: zu zweit aufstellen und einhalten",
  metaDescription: "Haushaltsbudget für Paare: die Methode in fünf Schritten, ein Beispiel mit 4 000 € im Monat, die 50/30/20-Regel, der Notgroschen und der monatliche Termin.",
  featuredImage: "/blog/budget-couple.webp",
  featuredImageAlt: "Die beiden Quiz-Couple-Figuren vor einer großen Tabelle auf einem Tisch, einem Taschenrechner und Umschlägen",
  publishedAt: "2027-02-27T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Ein Budget zu zweit dauert beim ersten Mal eine Stunde und danach zwanzig Minuten im Monat. Die Methode in fünf Schritten, ein Beispiel für ein Paar mit 4 000 €, die 50/30/20-Regel, die Werkzeuge, und was ihr tut, wenn ihr dem Partner Geld leiht.",
  introduction: `<p>Ein Haushaltsbudget für Paare ist keine Tabelle voller Verbote. <strong>Es heißt zu wissen, wohin das Geld zu zweit geht, damit man nicht mehr raten, sich nichts vorwerfen und auf nichts umsonst verzichten muss.</strong> Paare, die eines haben, streiten weniger übers Geld, nicht weil sie mehr davon haben, sondern weil sie wissen, was übrig ist.</p>
<p>Hier ist die Methode in fünf Schritten, ein Rechenbeispiel für ein Paar mit 4 000 € im Monat, die 50/30/20-Regel, die Werkzeuge, die funktionieren, der Notgroschen, und der Termin, der das alles zusammenhält.</p>`,
  quickSummary: [
    "Fünf Schritte: die Einkünfte, die Fixkosten, die variablen Kosten, das Sparen, und ein Taschengeld für jeden. Eine Stunde beim ersten Mal, danach zwanzig Minuten im Monat.",
    "Die 50/30/20-Regel gibt eine Größenordnung: die Hälfte für das Nötige, ein Drittel für Wünsche, ein Fünftel fürs Sparen. Ein Anhaltspunkt, kein Gesetz.",
    "Jährliche Kosten (Nachzahlungen, Versicherungen, Urlaub, Geschenke) werden durch zwölf geteilt und jeden Monat zurückgelegt: Sie sind es, die Budgets sprengen.",
    "Ein Notgroschen von drei Monatsausgaben, vor jedem anderen Projekt, nimmt die Angst, die die meisten Geldstreits nährt.",
    "Das Budget wird zu zweit überprüft, einmal im Monat, an einem festen Datum. Ein Budget, das man nicht anschaut, ist nur eine weitere Tabelle.",
  ],
  sections: [
    {
      id: "warum-ein-budget",
      title: "Warum ein Budget zu zweit alles ändert",
      content: `<p>Ohne Budget ist jede Ausgabe eine Verhandlung. Können wir uns dieses Restaurant leisten? Ist der Urlaub vernünftig? Warum hast du das gekauft? Und weil niemand weiß, was übrig ist, antwortet jeder aus dem Bauch: Der Sparer sagt nein, der Ausgeber sagt ja, und es geht von vorn los.</p>
<p><strong>Mit einem Budget ändert sich die Frage: Man fragt nicht mehr „können wir?“, man schaut auf die Zeile.</strong> Es sind noch 140 € für Freizeit übrig diesen Monat, also ja zum Restaurant, nein zum Wochenende. Niemand hat nachgegeben, niemand hat verboten. Das Budget hat entschieden, und ihr habt es zusammen geschrieben. Deshalb nennt der Leitfaden über <a href="/de/blog/geld-in-der-beziehung/">Geld in der Beziehung</a> es das Werkzeug, das alles beruhigt.</p>`,
    },
    {
      id: "die-methode",
      title: "Die Methode in fünf Schritten",
      content: `<ol>
<li><strong>Die Einkünfte:</strong> beide Nettogehälter, Kindergeld, regelmäßige Einnahmen. Weihnachts- und Urlaubsgeld werden auf zwölf Monate verteilt. Ihr bekommt, was jeden Monat reinkommt.</li>
<li><strong>Die Fixkosten:</strong> Miete oder Kreditrate, Nebenkosten, Strom, Internet, Handys, Versicherungen, Abos, Verkehr, Kita. Alles, was jeden Monat gleich fällig wird. Nehmt die letzten drei Kontoauszüge: Das geht schneller als raten.</li>
<li><strong>Die variablen Kosten:</strong> Einkäufe, Benzin, Ausgehen, Kleidung, Gesundheit. Bildet den Durchschnitt der letzten drei Monate, und addiert ein Zwölftel von allem, was einmal im Jahr fällig wird: Nachzahlungen, Kfz-Versicherung, Urlaub, Weihnachtsgeschenke, die Inspektion. Diese Zeile sprengt die Budgets, weil man sie vergisst.</li>
<li><strong>Das Sparen:</strong> ein fester Betrag, am Gehaltstag überwiesen, vor allem anderen. Wenn er „von dem, was übrig bleibt“ kommt, bleibt nie etwas übrig.</li>
<li><strong>Das Taschengeld:</strong> ein Betrag für jeden, gleich oder anteilig zum Einkommen, auf einem eigenen Konto, ohne Rechtfertigung. Es ist die Zeile, mit der der Ausgeber das Budget akzeptiert, und die, die am meisten vergessen wird.</li>
</ol>
<p>Wenn am Ende die Kosten die Einkünfte übersteigen, fängt man nicht damit an, die Freuden zu streichen: Man schaut auf die Fixkosten. Ein Abo zu viel, eine nie neu verhandelte Versicherung, ein Handytarif von vor fünf Jahren machen oft mehr aus als alle Kaffees des Monats.</p>`,
    },
    {
      id: "ein-beispiel",
      title: "Ein Beispiel für ein Paar mit 4 000 € im Monat",
      content: `<p>Zwei Personen, 1 800 und 2 200 € netto, eine Mietwohnung in der Stadt, keine Kinder. So sieht ein Budget aus, das hält:</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Ein Monat mit 4 000 €, zu zweit</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">2 000 €</span>Fixkosten: Warmmiete 1 200, Strom und Internet 150, Versicherungen 150, Handys 50, Verkehr 250, Abos 50, und 150 Rücklage für Kfz-Versicherung und Nachzahlungen des Jahres</li>
<li><span class="blog-chiffres-nombre">1 000 €</span>variable Kosten: Lebensmittel 550, Ausgehen und Restaurants 220, Kleidung und Gesundheit 100, und 130 jeden Monat für den Urlaub zurückgelegt</li>
<li><span class="blog-chiffres-nombre">550 €</span>Sparen, am Gehaltstag überwiesen, zuerst für den Notgroschen</li>
<li><span class="blog-chiffres-nombre">450 €</span>Taschengeld, 200 für den einen und 250 für den anderen, anteilig zum Einkommen, ohne Rechtfertigung</li>
</ul>
</div>
<p>Und wie jeder diese Zeilen füllt, ist die Frage der <a href="/de/blog/kosten-aufteilen-in-der-beziehung/">Kostenaufteilung in der Beziehung</a>: hier nach Einkommen, 45 % für den einen und 55 % für den anderen, mit zwei Daueraufträgen aufs Gemeinschaftskonto. Wenn ihr alles zusammenlegt, stellt sich die Frage nicht, und <a href="/de/blog/gemeinschaftskonto-oder-getrennte-konten/">Gemeinschaftskonto oder getrennte Konten</a> sagt, welches Modell zu welchem Budget passt.</p>`,
    },
    {
      id: "die-50-30-20-regel",
      title: "Die 50/30/20-Regel, um zu sehen, ob es vernünftig ist",
      content: `<p>Um zu prüfen, ob euer Budget nicht schief ist, ein bekannter Anhaltspunkt: <strong>die Hälfte der Einkünfte für das Nötige</strong> (Wohnen, Lebensmittel, Verkehr, Versicherungen, Gesundheit), <strong>dreißig Prozent für Wünsche</strong> (Ausgehen, Urlaub, Kleidung, Abos, Taschengeld), <strong>zwanzig Prozent fürs Sparen</strong> und die Tilgung von Schulden.</p>
<p>Im Beispiel oben macht das Nötige rund 65 % aus, die Wünsche 20 % und das Sparen 15 %: schwer beim Wohnen, wie bei den meisten Paaren in der Stadt, und das korrigiert man, indem man das Sparen erhöht, sobald sich ein Gehalt bewegt. Es ist kein Gesetz. Ein Paar mit hoher Miete in München liegt bei 60 % Nötigem, ein Paar mit abbezahltem Haus bei 40 %. Was die Regel sagt, ist, wo man hinschaut, wenn es nicht aufgeht.</p>`,
      tip: "Der Notgroschen zuerst: drei Monatsausgaben, auf einem verfügbaren Konto, vor jedem Projekt. Er nimmt die Angst, die die meisten Geldstreits nährt, weil ein unerwarteter Betrag keine Katastrophe mehr ist.",
    },
    {
      id: "die-werkzeuge",
      title: "Die Werkzeuge: Tabelle, App oder Umschläge",
      content: `<ul>
<li><strong>Die geteilte Tabelle:</strong> eine Spalte pro Monat, eine Zeile pro Posten, für beide auf dem Handy erreichbar. Kostenlos, flexibel, und das, was die meisten Paare am Ende benutzen.</li>
<li><strong>Die Budget-App:</strong> Sie liest eure Konten und sortiert die Ausgaben von selbst. Praktisch, um zu sehen, wohin das Geld geht, weniger, um zu zweit zu entscheiden: Sie zeigt, sie diskutiert nicht.</li>
<li><strong>Die Umschläge:</strong> die alte Methode, in bar oder als Unterkonten: ein Umschlag für Einkäufe, einer fürs Ausgehen, einer für den Urlaub. Wenn der Umschlag leer ist, hört man auf. Es ist die Methode, die bei Ausgebern am besten funktioniert, weil sie die Grenze sichtbar macht.</li>
</ul>
<p>Und ein Punkt, der alle Werkzeuge aufwiegt: <strong>der Termin</strong>. Zwanzig Minuten im Monat, an einem festen Datum, dem ersten Sonntag zum Beispiel, mit dem Budget vor Augen. Man schaut, was überschritten wurde, was nächsten Monat kommt, und jeder sagt, was ihn beschäftigt. Ein Budget, das man nicht zu zweit anschaut, ist nur eine weitere Tabelle. Der Artikel über <a href="/de/blog/ueber-geld-reden-in-der-beziehung/">Über Geld reden in der Beziehung</a> erklärt, wie man diesen Termin setzt, ohne dass er zur Pflicht wird.</p>`,
    },
    {
      id: "dem-partner-geld-leihen",
      title: "Dem Partner Geld leihen",
      content: `<p>Das passiert in vielen Paaren mit getrennten Konten: Einer streckt dem anderen eine größere Summe vor, für ein Auto, Eigenkapital, eine Schuld von früher. Und es endet öfter schlecht, als man denkt, nicht weil der andere nicht zurückzahlt, sondern weil niemand gesagt hat, ob es ein Darlehen oder ein Geschenk war.</p>
<p>Zwei Regeln. Die erste: <strong>Sagt es, in einem Satz, am selben Tag</strong>. „Ich leihe dir 3 000 €, du gibst sie mir zurück, wenn du kannst“ ist nicht dasselbe wie „ich helfe dir“, und beides ist in Ordnung, solange man weiß, welches es ist. Die zweite, ab ein paar hundert Euro und wenn ihr nicht verheiratet seid: <strong>ein Stück Papier</strong>, ein datiertes und unterschriebenes Schuldanerkenntnis, mit Betrag und Rückzahlungsrhythmus. Es wirkt kalt zwischen zwei Menschen, die sich lieben. Vor allem erlaubt es, nicht mehr daran zu denken, und in zwei Jahren keinen Streit daraus zu machen. Der Leitfaden über <a href="/de/blog/geld-in-der-beziehung/">Geld in der Beziehung</a> erinnert daran, was das Gesetz für unverheiratete Paare sagt, oder nicht sagt.</p>
<p>Um zu wissen, ob ihr das Sparen gleich seht, absolute Priorität für den einen und „man muss das Leben genießen“ für den anderen, stellt die <a href="/de/beziehungsanalyse/" data-bilan-src="article-argent">Beziehungsanalyse, jeder auf seinem eigenen Handy</a>, jedem die Frage, zusammen mit der, was ihr mit 1 000 € vom Himmel machen würdet. Die beiden Antworten nebeneinander sind oft der Ausgangspunkt des ersten Budgets.</p>
<a href="/de/blog/geld-in-der-beziehung/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lies auch</span><span class="blog-read-also-title">Geld in der Beziehung: wie ihr das Geld zu zweit regelt, ohne dass es im Streit endet</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
