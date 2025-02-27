import { getFontConfig } from "./utils/getFontConfig";
import ReactMarkdown from "react-markdown";
import { isBengaliText } from "./utils/isBengaliText";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Font configuration
const notoSerifBengali = getFontConfig();

const LaTeXRenderer = ({ children }) => {
    // Helper function to extract text from object structure
    const extractText = (node) => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (node?.props?.children) return extractText(node.props.children);
      if (node?.type && typeof node.type === "symbol") {
        return extractText(node.props?.children);
      }
      return "";
    };
  
    // Get the actual text content
    const textContent = extractText(children);
  
    // Check if content has Bengali
    const hasBengali = isBengaliText(textContent);
    const hasLatex = textContent.includes("$");
  
    // If content has LaTeX, wrap it in ReactMarkdown with proper font class
    if (hasLatex) {
      return (
        <span
          className={hasBengali ? notoSerifBengali.className : "font-katex-main"}
        >
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[
              [
                rehypeKatex,
                {
                  trust: true,
                  strict: false,
                  throwOnError: false,
                  output: "html",
                  globalGroup: true,
                },
              ],
            ]}
          >
            {textContent}
          </ReactMarkdown>
        </span>
      );
    }
  
    // If no LaTeX, just apply appropriate font class
    return (
      <span
        className={hasBengali ? notoSerifBengali.className : "font-katex-main"}
      >
        {textContent}
      </span>
    );
  };

export default LaTeXRenderer;