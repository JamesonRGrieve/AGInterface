'use client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getCookie } from 'cookies-next';
import 'katex/dist/katex.min.css';
import { ChevronDown, Copy, Download } from 'lucide-react';
import { ReactNode, useRef, useState } from 'react';
import Latex from 'react-latex-next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark, a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { DataTable } from '../data-table';
import { createColumns } from '../data-table/data-table-columns';
import Mermaid from './Code/Mermaid';
import { parseXSVData } from './Code/ParseXSVData';
import MarkdownBlock from './MarkdownBlock';
import TabPanel from './TabPanel';

const fileExtensions = {
  '': 'txt',
  text: 'txt',
  python: 'py',
  javascript: 'js',
  typescript: 'ts',
  html: 'html',
  css: 'css',
  json: 'json',
  yaml: 'yaml',
  markdown: 'md',
  shell: 'sh',
  bash: 'sh',
  sql: 'sql',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'cs',
  go: 'go',
  rust: 'rs',
  php: 'php',
  ruby: 'rb',
  perl: 'pl',
  lua: 'lua',
  r: 'r',
  swift: 'swift',
  kotlin: 'kt',
  scala: 'scala',
  clojure: 'clj',
  elixir: 'ex',
  erlang: 'erl',
  haskell: 'hs',
  ocaml: 'ml',
  pascal: 'pas',
  scheme: 'scm',
  coffeescript: 'coffee',
  fortran: 'f',
  julia: 'jl',
  lisp: 'lisp',
  prolog: 'pro',
  vbnet: 'vb',
  dart: 'dart',
  fsharp: 'fs',
  groovy: 'groovy',
  perl6: 'pl',
  powershell: 'ps1',
  puppet: 'pp',
  qml: 'qml',
  racket: 'rkt',
  sas: 'sas',
  tsv: 'tsv',
  flow: 'flow',
  mermaid: 'mermaid',
  sequence: 'sequence',
  gantt: 'gantt',
  verilog: 'v',
  vhdl: 'vhd',
  apex: 'cls',
  matlab: 'm',
  nim: 'nim',
  csv: 'csv',
  xml: 'xml',
  latex: 'latex',
};

const languageRenders = {
  markdown: (content) => <MarkdownBlock content={content} />,
  html: (content) => <div dangerouslySetInnerHTML={{ __html: content }} />,
  csv: (content, setLoading) => {
    const csvData = (
      content.constructor === Array
        ? content.length > 1
          ? content
          : content[0]
        : content
            .split('\n')
            .filter((row) => row.trim())
            .map((row) => row.trim())
    )
      .filter((row) => row.trim())
      .map((row) => row.trim());

    const result = parseXSVData(csvData, ',');

    if ('error' in result) {
      return <div>Error: {result.error}</div>;
    }

    return <DataTable columns={createColumns(result.columns)} data={result.rows} />;
  },
  tsv: (content, setLoading) => {
    const tsvData = (content.constructor === Array ? (content.length > 1 ? content : content[0]) : content.split('\n'))
      .filter((row) => row.trim())
      .map((row) => row.trim());

    const result = parseXSVData(tsvData, '\t');

    if ('error' in result) {
      return <div>Error: {result.error}</div>;
    }

    return <DataTable columns={createColumns(result.columns)} data={result.rows} />;
  },
  gantt: (content) => <Mermaid chart={'gantt\n' + content} />,
  sequence: (content) => <Mermaid chart={'sequenceDiagram\n' + content} />,
  flow: (content) => <Mermaid chart={'flowchart TD\n' + content} />,
  mermaid: (content) => <Mermaid chart={content} />,
  latex: (content) => <Latex>{content[0]}</Latex>,
};

export type CodeBlockProps = {
  inline?: boolean;
  children?: string;
  language?: string;
  fileName?: string;
  setLoading?: (loading: boolean) => void;
};

export default function CodeBlock({
  inline = false,
  children,
  language = 'Text',
  fileName,
  setLoading,
  ...props
}: CodeBlockProps): ReactNode {
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  if (inline) {
    return <span className='bg-gray-200 dark:bg-gray-700 rounded-md px-1 py-0.5 font-mono'>{children}</span>;
  }

  if (!language || language === 'Text') {
    const languages = Object.entries(fileExtensions).flat();
    const potentialLanguage = children.split('\n')[0].trim();
    if (languages.includes(potentialLanguage)) {
      language = potentialLanguage;
      children = children.substring(children.indexOf('\n') + 1);
    }
  }

  const fileNameWithExtension = `${fileName || 'code'}.${fileExtensions[String(language.toLowerCase())] || 'txt'}`;

  const copyCode = () => {
    if (codeBlockRef.current) {
      const actualCode = codeBlockRef.current.querySelector('code')?.cloneNode(true) as HTMLElement;
      actualCode.querySelectorAll('.react-syntax-highlighter-line-number').forEach((el) => el.remove());
      navigator.clipboard.writeText(actualCode.innerText);
    }
  };

  const downloadCode = () => {
    if (codeBlockRef.current) {
      const actualCode = codeBlockRef.current.querySelector('code')?.cloneNode(true) as HTMLElement;
      actualCode.querySelectorAll('.react-syntax-highlighter-line-number').forEach((el) => el.remove());
      const element = document.createElement('a');
      const file = new Blob([actualCode.innerText], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = fileNameWithExtension;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`my-2 overflow-hidden border rounded-lg bg-background transition-all duration-300 ease-in-out ${isOpen ? 'w-full' : 'inline-block'}`}
    >
      <div className='relative flex items-center justify-between pr-4 border-b-2 border-border'>
        <CollapsibleTrigger className='p-2 hover:bg-muted'>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </CollapsibleTrigger>

        {Object.keys(languageRenders).includes(language) && (
          <div className='flex'>
            <button className={`px-4 py-2 ${tab === 0 ? 'bg-muted' : ''}`} onClick={() => setTab(0)}>
              Rendered
            </button>
            <button className={`px-4 py-2 ${tab === 1 ? 'bg-muted' : ''}`} onClick={() => setTab(1)}>
              Source
            </button>
          </div>
        )}
        <div className='flex items-center'>
          <button onClick={copyCode} className='p-2 rounded-full hover:bg-muted'>
            <Copy className='w-5 h-5' />
          </button>
          <button onClick={downloadCode} className='p-2 rounded-full hover:bg-muted'>
            <Download className='w-5 h-5' />
          </button>
          <span className='ml-2 text-sm'>
            {fileNameWithExtension || 'text.txt'} | {language || ''}
          </span>
        </div>
      </div>

      <CollapsibleContent className='transition-all duration-300 ease-in-out'>
        {Object.keys(languageRenders).includes(language) && (
          <TabPanel value={tab} index={0}>
            <div className='code-container'>{languageRenders[language.toString()](children, setLoading)}</div>
          </TabPanel>
        )}

        <TabPanel value={tab} index={Object.keys(languageRenders).includes(language) ? 1 : 0}>
          <div className='code-container' ref={codeBlockRef}>
            {language.toLowerCase() in fileExtensions ? (
              <SyntaxHighlighter
                {...props}
                language={language.toLowerCase()}
                style={getCookie('theme')?.includes('dark') ? a11yDark : a11yLight}
                showLineNumbers
                wrapLongLines
              >
                {children}
              </SyntaxHighlighter>
            ) : (
              <code className='code-block' {...props}>
                {children}
              </code>
            )}
          </div>
        </TabPanel>
      </CollapsibleContent>
    </Collapsible>
  );
}
