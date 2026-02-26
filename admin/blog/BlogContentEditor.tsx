import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bold, Link, Image, Table, Lightbulb, Code, Eye, Star, Save } from 'lucide-react';

interface BlogContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const BLOCK_TYPES = [
  { value: 'p', label: 'Paragraphe' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'h4', label: 'H4' },
];

const TABLE_TEMPLATE = `<div class="blog-table-wrapper"><table><thead><tr><th>En-tête 1</th><th>En-tête 2</th><th>En-tête 3</th></tr></thead><tbody><tr><td>Cellule</td><td>Cellule</td><td>Cellule</td></tr><tr><td>Cellule</td><td>Cellule</td><td>Cellule</td></tr></tbody></table></div>`;

const TIP_TEMPLATE = `<aside class="blog-tip-box"><p class="blog-tip-box-title">💡 Astuce</p><p>Votre astuce ici…</p></aside>`;

const NOTE_TEMPLATE = `<h2>Notre note</h2><p class="blog-note-score"><strong>X/10</strong></p><p>Votre analyse ici…</p>`;

export function BlogContentEditor({ value, onChange, onSave, isSaving = false }: BlogContentEditorProps) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [htmlSource, setHtmlSource] = useState(value || '');
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentBlock, setCurrentBlock] = useState('p');
  const isInternalUpdateRef = useRef(false);
  const pendingVisualSyncRef = useRef<string | null>(null);
  const latestHtmlRef = useRef(value || '');

  const applyHtmlToVisual = useCallback((html: string) => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, []);

  useEffect(() => {
    latestHtmlRef.current = htmlSource;
  }, [htmlSource]);

  useEffect(() => {
    const normalizedValue = value || '';

    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    setHtmlSource(normalizedValue);
    latestHtmlRef.current = normalizedValue;
    if (mode === 'visual') {
      applyHtmlToVisual(normalizedValue);
    }
  }, [value, mode, applyHtmlToVisual]);

  useEffect(() => {
    if (mode !== 'visual') return;

    const htmlToApply = pendingVisualSyncRef.current ?? latestHtmlRef.current;
    requestAnimationFrame(() => {
      applyHtmlToVisual(htmlToApply);
    });
    pendingVisualSyncRef.current = null;
  }, [mode, applyHtmlToVisual]);

  const sanitizeHtml = useCallback((raw: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${raw}</div>`, 'text/html');
    const root = doc.body.firstElementChild!;

    // Remove all style attributes
    root.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));

    // Unwrap useless spans (no class, no id, no meaningful attribute)
    root.querySelectorAll('span').forEach(span => {
      if (!span.className && !span.id && span.attributes.length === 0) {
        span.replaceWith(...Array.from(span.childNodes));
      }
    });

    // Remove empty paragraphs
    root.querySelectorAll('p').forEach(p => {
      if (!p.textContent?.trim() && !p.querySelector('img')) {
        p.remove();
      }
    });

    return root.innerHTML;
  }, []);

  const formatHtml = useCallback((raw: string): string => {
    const clean = sanitizeHtml(raw);
    const compact = clean.replace(/>\s+</g, '><').trim();

    return compact
      .replace(/<(h[1-6]|p|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|aside|div|section)(\b[^>]*)>/gi, '\n<$1$2>')
      .replace(/<\/(h[1-6]|p|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|aside|div|section)>/gi, '</$1>\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, [sanitizeHtml]);

  const emitChange = (nextHtml: string) => {
    isInternalUpdateRef.current = true;
    onChange(nextHtml);
  };

  const switchMode = (newMode: 'visual' | 'html') => {
    if (newMode === mode) return;

    if (newMode === 'html') {
      const html = editorRef.current?.innerHTML || htmlSource || '';
      const formatted = formatHtml(html);
      setHtmlSource(formatted);
      latestHtmlRef.current = formatted;
      emitChange(formatted);
      setMode('html');
      return;
    }

    pendingVisualSyncRef.current = htmlSource;
    latestHtmlRef.current = htmlSource;
    emitChange(htmlSource);
    setMode('visual');
  };

  const handleInput = () => {
    if (mode === 'visual' && editorRef.current) {
      const html = sanitizeHtml(editorRef.current.innerHTML);
      setHtmlSource(html);
      emitChange(html);
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextHtml = e.target.value;
    setHtmlSource(nextHtml);
    emitChange(nextHtml);
  };

  const updateCurrentBlock = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === 1) {
        const tag = (node as Element).tagName.toLowerCase();
        if (['h2', 'h3', 'h4', 'p'].includes(tag)) {
          setCurrentBlock(tag);
          return;
        }
      }
      node = node.parentNode;
    }
    setCurrentBlock('p');
  };

  const execFormat = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    updateCurrentBlock();
    handleInput();
  };

  const changeBlockType = (type: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, `<${type}>`);
    setCurrentBlock(type);
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('URL du lien :');
    if (url) {
      execFormat('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('URL de l\'image :');
    if (url) {
      const alt = prompt('Texte alternatif :') || '';
      execFormat('insertHTML', `<img src="${url}" alt="${alt}" />`);
    }
  };

  const insertTable = () => {
    execFormat('insertHTML', TABLE_TEMPLATE);
  };

  const insertTip = () => {
    execFormat('insertHTML', TIP_TEMPLATE);
  };

  const insertNote = () => {
    execFormat('insertHTML', NOTE_TEMPLATE);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    let html = e.clipboardData.getData('text/html');
    if (!html) {
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
      return;
    }

    // Sanitize pasted HTML immediately
    html = sanitizeHtml(html);

    html = html.replace(
      /(?<!<div[^>]*class="blog-table-wrapper"[^>]*>\s*)<table/gi,
      '<div class="blog-table-wrapper"><table'
    );
    html = html.replace(/<\/table>(?!\s*<\/div>)/gi, '</table></div>');
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      let node: Node | null = sel.anchorNode;

      while (node && node !== editorRef.current) {
        if (node.nodeType === 1) {
          const el = node as Element;
          if (el.tagName === 'TABLE' || el.tagName === 'ASIDE' || el.classList?.contains('blog-tip-box')) {
            return;
          }
        }
        node = node.parentNode;
      }

      setTimeout(() => {
        const sel2 = window.getSelection();
        if (sel2 && sel2.rangeCount) {
          let current: Node | null = sel2.anchorNode;
          while (current && current !== editorRef.current) {
            if (current.nodeType === 1 && (current as Element).tagName === 'DIV' && current !== editorRef.current) {
              document.execCommand('formatBlock', false, '<p>');
              break;
            }
            current = current.parentNode;
          }
        }
        handleInput();
      }, 0);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 bg-card/95 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center gap-1 mr-2 border-r border-border pr-2">
          <Button
            type="button"
            variant={mode === 'visual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('visual')}
          >
            <Eye className="w-3 h-3 mr-1" /> Visuel
          </Button>
          <Button
            type="button"
            variant={mode === 'html' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('html')}
          >
            <Code className="w-3 h-3 mr-1" /> HTML
          </Button>
        </div>

        {mode === 'visual' && (
          <>
            <Select value={currentBlock} onValueChange={changeBlockType}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map(bt => (
                  <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="border-l border-border pl-1 ml-1" />

            <Button type="button" variant="ghost" size="sm" onClick={() => execFormat('bold')} title="Gras">
              <Bold className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={insertLink} title="Lien">
              <Link className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={insertImage} title="Image">
              <Image className="w-4 h-4" />
            </Button>

            <div className="border-l border-border pl-1 ml-1" />

            <Button type="button" variant="ghost" size="sm" onClick={insertTable} title="Tableau responsive">
              <Table className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={insertTip} title="Encart Astuce">
              <Lightbulb className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={insertNote} title="Bloc Notre note">
              <Star className="w-4 h-4" />
            </Button>
          </>
        )}

        {onSave && (
          <div className="ml-auto border-l border-border pl-2">
            <Button type="button" size="sm" onClick={onSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
            </Button>
          </div>
        )}
      </div>

      {mode === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          className="blog-article min-h-[420px] p-6 outline-none focus:ring-0 prose-editor"
          onInput={handleInput}
          onKeyUp={updateCurrentBlock}
          onMouseUp={updateCurrentBlock}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          suppressContentEditableWarning
        />
      ) : (
        <textarea
          value={htmlSource}
          onChange={handleHtmlChange}
          className="w-full min-h-[420px] p-4 font-mono text-sm bg-background text-foreground resize-y outline-none"
          spellCheck={false}
        />
      )}
    </div>
  );
}

