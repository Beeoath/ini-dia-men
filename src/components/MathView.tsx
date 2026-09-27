import React, { useMemo } from "react";
import katex from "katex";

export interface MathViewProps {
  math?: string;
  children?: string;
  block?: boolean;
  className?: string;
}

/**
 * Renders pure LaTeX using KaTeX safely without throwing errors.
 */
export const MathView: React.FC<MathViewProps> = ({
  math,
  children,
  block = false,
  className = "",
}) => {
  const formula = (math ?? children ?? "").trim();

  const html = useMemo(() => {
    if (!formula) return "";
    try {
      return katex.renderToString(formula, {
        displayMode: block,
        throwOnError: false,
        output: "htmlAndMathml",
      });
    } catch {
      return formula;
    }
  }, [formula, block]);

  if (!formula) return null;

  return (
    <span
      className={`inline-math ${block ? "block text-center my-2 overflow-x-auto" : "inline"} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Parses mixed text containing inline ($...$) or block ($$...$$) LaTeX expressions
 * or standard math keywords, and renders them seamlessly.
 */
export const FormattedMathText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = "" }) => {
  const parts = useMemo(() => {
    if (!text) return [];

    // Regex to detect $$block math$$ or $inline math$
    // Also matches \[ ... \] or \( ... \)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([^\n]+?\\\))/g;

    const tokens: Array<{ type: "text" | "math"; content: string; block?: boolean }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        });
      }

      const raw = match[0];
      if (raw.startsWith("$$") && raw.endsWith("$$")) {
        tokens.push({
          type: "math",
          content: raw.slice(2, -2).trim(),
          block: true,
        });
      } else if (raw.startsWith("\\[") && raw.endsWith("\\]")) {
        tokens.push({
          type: "math",
          content: raw.slice(2, -2).trim(),
          block: true,
        });
      } else if (raw.startsWith("$") && raw.endsWith("$")) {
        tokens.push({
          type: "math",
          content: raw.slice(1, -1).trim(),
          block: false,
        });
      } else if (raw.startsWith("\\(") && raw.endsWith("\\)")) {
        tokens.push({
          type: "math",
          content: raw.slice(2, -2).trim(),
          block: false,
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push({
        type: "text",
        content: text.slice(lastIndex),
      });
    }

    return tokens;
  }, [text]);

  if (!parts.length) return null;

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (p.type === "math") {
          return (
            <MathView key={idx} math={p.content} block={p.block} />
          );
        }
        return <span key={idx}>{p.content}</span>;
      })}
    </span>
  );
};
