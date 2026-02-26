/**
 * Parse a monolithic HTML string into introduction + sections structure
 * compatible with BlogArticleData.
 */

interface ParsedSection {
  id: string;
  title: string;
  content: string;
  tip?: string;
  subsections?: { id: string; title: string; content: string }[];
}

interface ParsedContent {
  introduction: string;
  sections: ParsedSection[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse monolithic HTML into introduction + sections[].
 * Splits on <h2> tags. Within each section, extracts <h3> as subsections
 * and <aside class="blog-tip-box"> as the section tip.
 */
export function parseHtmlToSections(html: string): ParsedContent {
  if (!html.trim()) {
    return { introduction: '', sections: [] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild!;

  const children = Array.from(root.childNodes);

  let introduction = '';
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  let currentSectionContent = '';
  let currentSubsection: { id: string; title: string; content: string } | null = null;
  let currentSubContent = '';

  const flushSubsection = () => {
    if (currentSubsection) {
      currentSubsection.content = currentSubContent.trim();
      if (!currentSection!.subsections) currentSection!.subsections = [];
      currentSection!.subsections.push(currentSubsection);
      currentSubsection = null;
      currentSubContent = '';
    }
  };

  const flushSection = () => {
    flushSubsection();
    if (currentSection) {
      currentSection.content = currentSectionContent.trim();
      sections.push(currentSection);
      currentSection = null;
      currentSectionContent = '';
    }
  };

  const getOuterHTML = (node: Node): string => {
    if (node.nodeType === 1) return (node as Element).outerHTML;
    if (node.nodeType === 3) return node.textContent || '';
    return '';
  };

  for (const node of children) {
    const el = node.nodeType === 1 ? (node as Element) : null;
    const tag = el?.tagName?.toLowerCase();

    // Tip boxes stay inline in the content – do NOT extract them

    if (tag === 'h2') {
      flushSection();
      const title = el!.textContent || '';
      currentSection = {
        id: slugify(title) || `section-${sections.length}`,
        title,
        content: '',
        subsections: [],
      };
      currentSectionContent = '';
      continue;
    }

    if (tag === 'h3' && currentSection) {
      flushSubsection();
      const title = el!.textContent || '';
      currentSubsection = {
        id: slugify(title) || `sub-${(currentSection.subsections?.length || 0)}`,
        title,
        content: '',
      };
      currentSubContent = '';
      continue;
    }

    const outerHTML = getOuterHTML(node);
    if (!outerHTML) continue;

    if (!currentSection) {
      introduction += outerHTML;
    } else if (currentSubsection) {
      currentSubContent += outerHTML;
    } else {
      currentSectionContent += outerHTML;
    }
  }

  flushSection();

  return { introduction: introduction.trim(), sections };
}

/**
 * Reconstruct monolithic HTML from introduction + sections[].
 */
export function sectionsToHtml(introduction: string, sections: { id: string; title: string; content: string; tip?: string; subsections?: { id: string; title: string; content: string }[] }[]): string {
  let html = introduction || '';

  for (const section of sections) {
    html += `\n<h2>${section.title}</h2>\n`;
    html += section.content || '';

    if (section.tip) {
      html += `\n<aside class="blog-tip-box"><p class="blog-tip-box-title">💡 Astuce</p>${section.tip}</aside>\n`;
    }

    if (section.subsections) {
      for (const sub of section.subsections) {
        html += `\n<h3>${sub.title}</h3>\n`;
        html += sub.content || '';
      }
    }
  }

  return html.trim();
}
