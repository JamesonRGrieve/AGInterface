import log from '@/next-log/log';
import mermaid from 'mermaid';
import React from 'react';
// https://codesandbox.io/p/sandbox/react-with-mermaid-ex9f7?file=%2Fsrc%2FMermaid.js%3A1%2C1-64%2C1

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const id = React.useId();
  log(['Rendering Mermaid Chart', chart], { client: 2 });
  React.useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      themeCSS: `
        g.classGroup rect {
          fill: #282a36;
          stroke: #6272a4;
        } 
        g.classGroup text {
          fill: #f8f8f2;
        }
        g.classGroup line {
          stroke: #f8f8f2;
          stroke-width: 0.5;
        }
        .classLabel .box {
          stroke: #21222c;
          stroke-width: 3;
          fill: #21222c;
          opacity: 1;
        }
        .classLabel .label {
          fill: #f1fa8c;
        }
        .relation {
          stroke: #ff79c6;
          stroke-width: 1;
        }
        #compositionStart, #compositionEnd {
          fill: #bd93f9;
          stroke: #bd93f9;
          stroke-width: 1;
        }
        #aggregationEnd, #aggregationStart {
          fill: #21222c;
          stroke: #50fa7b;
          stroke-width: 1;
        }
        #dependencyStart, #dependencyEnd {
          fill: #00bcd4;
          stroke: #00bcd4;
          stroke-width: 1;
        } 
        #extensionStart, #extensionEnd {
          fill: #f8f8f2;
          stroke: #f8f8f2;
          stroke-width: 1;
        }`,
      fontFamily: 'Fira Code',
    });

    mermaid.contentLoaded();
  }, []);

  return (
    <pre className='mermaid' id={id}>
      {chart}
    </pre>
  );
};

export default Mermaid;
