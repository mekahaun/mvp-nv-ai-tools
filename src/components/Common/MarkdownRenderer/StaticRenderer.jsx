import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import emoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import CustomMarkdownComponents from "./CustomMarkdownComponents";

// KaTeX options configuration
const katexOptions = {
  trust: true,
  strict: false,
  throwOnError: false,
  macros: {},
  output: "html",
  globalGroup: true,
};

const StaticRenderer = ({ content }) => {
  if (!content) return null;

  return (
    <div className="overflow-auto">
      <div className="max-w-full markdown-body">
        <ReactMarkdown
          remarkPlugins={[
            remarkMath,
            [remarkGfm, { footnotes: true }],
            emoji,
            [remarkToc, { tight: true }],
          ]}
          rehypePlugins={[
            [rehypeKatex, katexOptions],
            [
              rehypeRaw,
              {
                passThrough: [
                  "span",
                  "table",
                  "thead",
                  "tbody",
                  "tr",
                  "th",
                  "td",
                ],
              },
            ],
          ]}
          components={CustomMarkdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

// Memoize the component
export default memo(StaticRenderer);
