import React, { useMemo } from "react";
import katex from "katex";

export interface MathViewProps {
  math?: string;
  children?: string;
  block?: boolean;
  className?: string;
}

/**
 * Normalizes common typos and converts freestanding LaTeX into delimited math.
 */
export function normalizeMathText(raw: string): string {
  if (!raw) return "";

  // 1. Ganti typo forward-slash umum: /frac{ -> \frac{, /sqrt{ -> \sqrt{, dsb.
  let text = raw
    .replace(/\/frac(?=\{)/g, "\\frac")
    .replace(/\/sqrt(?=[{\[])/g, "\\sqrt")
    .replace(/\/cdot\b/g, "\\cdot")
    .replace(/\/times\b/g, "\\times")
    .replace(/\/pm\b/g, "\\pm")
    .replace(/\/text(?=\{)/g, "\\text")
    .replace(/\/alpha\b/g, "\\alpha")
    .replace(/\/beta\b/g, "\\beta")
    .replace(/\/theta\b/g, "\\theta")
    .replace(/\/pi\b/g, "\\pi");

  // Ubah simbol akar unicode '√' menjadi '\sqrt' jika ada
  text = text.replace(/√(\d+)/g, "\\sqrt{$1}").replace(/√\s*([a-zA-Z])/g, "\\sqrt{$1}");

  // 2. Jika string belum memiliki pembatas math ($ atau $$ atau \[ atau \()
  const hasDelimiter = text.includes("$") || text.includes("\\[") || text.includes("\\(");

  if (!hasDelimiter) {
    // Deteksi apakah teks ini mengandung perintah LaTeX atau formula matematika
    const hasLatexCommands =
      /\\(frac|sqrt|text|pm|times|cdot|circ|le|ge|ne|approx|sim|alpha|beta|theta|pi|sin|cos|tan|csc|sec|cot|log|ln|lim|sum|int|infty|left|right|begin|quad|qquad)\b/.test(
        text
      ) ||
      /\b\d+\/\d+\b/.test(text) || // Pecahan biasa seperti -7/15, 11/15
      /\^[\w{]/.test(text) || // Pangkat seperti x^2 atau 3^{n-1}
      /_[\w{]/.test(text); // Indeks seperti x_1

    if (hasLatexCommands) {
      // Periksa apakah diawali prefix pilihan soal seperti "A. ", "B. ", "1. ", dsb.
      const prefixMatch = text.match(/^([A-Ea-e]\.\s*)(.*)$/);
      if (prefixMatch) {
        const prefix = prefixMatch[1];
        const mathBody = prefixMatch[2].trim();
        return `${prefix}$${mathBody}$`;
      }

      // Bila seluruh string adalah formula matematika
      return `$${text.trim()}$`;
    }
  }

  // 3. Bila string campuran memiliki \frac{...}{...} atau \sqrt{...} yang tercecer di luar pembatas $
  // Bungkus ekspresi \frac dan \sqrt bebas tersebut dengan $...$
  text = text.replace(/(?<!\$)\\frac\{[^{}]*\}\{[^{}]*\}(?!\$)/g, (match) => `$${match}$`);
  text = text.replace(/(?<!\$)\\sqrt\{[^{}]*\}(?!\$)/g, (match) => `$${match}$`);
  text = text.replace(/(?<!\$)\\sqrt\[[^{}\]]*\]\{[^{}]*\}(?!\$)/g, (match) => `$${match}$`);

  return text;
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
  const rawFormula = (math ?? children ?? "").trim();
  const formula = useMemo(() => {
    return rawFormula
      .replace(/\/frac(?=\{)/g, "\\frac")
      .replace(/\/sqrt(?=[{\[])/g, "\\sqrt")
      .replace(/\/cdot\b/g, "\\cdot")
      .replace(/\/times\b/g, "\\times")
      .replace(/\/pm\b/g, "\\pm")
      .replace(/\/text(?=\{)/g, "\\text");
  }, [rawFormula]);

  const html = useMemo(() => {
    if (!formula) return "";
    try {
      return katex.renderToString(formula, {
        displayMode: block,
        throwOnError: false,
        output: "html",
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
  const processedText = useMemo(() => normalizeMathText(text || ""), [text]);

  const parts = useMemo(() => {
    if (!processedText) return [];

    // Regex to detect $$block math$$ or $inline math$
    // Also matches \[ ... \] or \( ... \)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([^\n]+?\\\))/g;

    const tokens: Array<{ type: "text" | "math"; content: string; block?: boolean }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(processedText)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: "text",
          content: processedText.slice(lastIndex, match.index),
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

    if (lastIndex < processedText.length) {
      tokens.push({
        type: "text",
        content: processedText.slice(lastIndex),
      });
    }

    return tokens;
  }, [processedText]);

  if (!parts.length) return null;

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (p.type === "math") {
          return <MathView key={idx} math={p.content} block={p.block} />;
        }
        return <span key={idx}>{p.content}</span>;
      })}
    </span>
  );
};
