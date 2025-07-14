export type MarkdownBlockProps = {
  children: string;
};
type BlockType = 'codeblock' | 'code' | undefined;
type Segment = {
  type?: BlockType;
  content: string;
};
function reprocess(processed: Segment[], rule: any, type: BlockType) {
  return processed
    .map((value) => {
      if (value.type === undefined) {
        const result = rule(value.content).map((value: string, index: number) => ({
          type: index % 2 === 1 ? type : undefined,
          content: value,
        }));
        if (result.length % 2 !== 1) {
          throw new Error(`Unterminated ${type} detected in content: ${value.content}!`);
        }
        return result.filter((segment: Segment) => segment.content);
      } else {
        return [value];
      }
    })
    .flat();
}
function splitUnEscaped(text: string, delimiter: string) {
  return text
    .replaceAll('\\' + delimiter, '´')
    .split(delimiter)
    .map((section) => section.replaceAll('´', '\\' + delimiter));
}
export default function textToMarkdown(text: string) {
  // Only split code on code blocks (not inline code)
  // const splitCode = reprocess(splitCodeBlocks, (content: string) => splitUnEscaped(content, '`'), 'code');
  return reprocess([{ content: text }], (content: string) => splitUnEscaped(content, '```'), 'codeblock');
}
