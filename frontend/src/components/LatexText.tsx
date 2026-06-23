interface LatexTextProps {
  text: string;
  className?: string;
}

function renderInlineMath(text: string, keyPrefix: string) {
  const parts = text.split(/(\$[^$\n]+\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <span className="math-inline" key={`${keyPrefix}-inline-${index}`}>
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={`${keyPrefix}-text-${index}`}>{part}</span>;
  });
}

export function LatexText({ text, className }: LatexTextProps) {
  const blocks = text.split(/(\$\$[\s\S]+?\$\$)/g);

  return (
    <span className={className}>
      {blocks.map((block, index) => {
        if (block.startsWith('$$') && block.endsWith('$$')) {
          return (
            <span className="math-display" key={`block-${index}`}>
              {block.slice(2, -2).trim()}
            </span>
          );
        }
        return renderInlineMath(block, `block-${index}`);
      })}
    </span>
  );
}
