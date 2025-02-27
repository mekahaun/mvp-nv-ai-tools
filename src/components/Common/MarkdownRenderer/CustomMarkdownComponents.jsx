import { getFontConfig } from "./utils/getFontConfig";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import LaTeXRenderer from "./LaTeXRenderer";
import MixedFontText from "./MixedFontText";
import { getTextContent } from "./utils/getTextContent";
import { isBengaliText } from "./utils/isBengaliText";

const notoSerifBengali = getFontConfig();

const CustomMarkdownComponents = {
    // Headers with anchor links
    h1: ({ children, id, ...props }) => (
      <h1
        id={id}
        className="text-4xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200 group"
        {...props}
      >
        <MixedFontText>{children}</MixedFontText>
        {id && (
          <a
            href={`#${id}`}
            className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 no-underline"
            aria-label="Direct link to heading"
          >
            #
          </a>
        )}
      </h1>
    ),
    h2: ({ children, id, ...props }) => (
      <h2 id={id} className="text-3xl font-bold mt-6 mb-4 group" {...props}>
        <MixedFontText>{children}</MixedFontText>
        {id && (
          <a
            href={`#${id}`}
            className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 no-underline"
            aria-label="Direct link to heading"
          >
            #
          </a>
        )}
      </h2>
    ),
    h3: ({ children, id, ...props }) => (
      <h3 id={id} className="text-2xl font-semibold mt-5 mb-3 group" {...props}>
        <MixedFontText>{children}</MixedFontText>
        {id && (
          <a
            href={`#${id}`}
            className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 no-underline"
            aria-label="Direct link to heading"
          >
            #
          </a>
        )}
      </h3>
    ),
    h4: ({ children, id, ...props }) => (
      <h4 id={id} className="text-xl font-semibold mt-4 mb-2 group" {...props}>
        <MixedFontText>{children}</MixedFontText>
        {id && (
          <a
            href={`#${id}`}
            className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400"
          >
            #
          </a>
        )}
      </h4>
    ),
    h5: ({ children, id, ...props }) => (
      <h5 id={id} className="text-lg font-semibold mt-3 mb-2" {...props}>
        <MixedFontText>{children}</MixedFontText>
      </h5>
    ),
    h6: ({ children, id, ...props }) => (
      <h6 id={id} className="text-base font-semibold mt-2 mb-2" {...props}>
        <MixedFontText>{children}</MixedFontText>
      </h6>
    ),
  
    // Block elements
    p: ({ children, ...props }) => (
      <p
        className="my-0 leading-7 break-words whitespace-normal max-w-full"
        {...props}
      >
        <MixedFontText>{children}</MixedFontText>
      </p>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-200 pl-4 my-4 py-2 text-gray-700 bg-gray-50 rounded"
        {...props}
      >
        <MixedFontText>{children}</MixedFontText>
      </blockquote>
    ),
  
    // Lists
    ul: ({ children, ...props }) => (
      <ul className="list-square pl-6 my-4 space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-6 my-4 space-y-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="my-1 pl-2" {...props}>
        <MixedFontText>{children}</MixedFontText>
      </li>
    ),
  
    table: ({ children, ...props }) => {
      const hasHtmlAttrs =
        props.style || props.border || props.cellPadding || props.cellSpacing;
      return (
        <div className="my-6 overflow-x-auto">
          <table
            style={props.style}
            className={
              !hasHtmlAttrs
                ? "min-w-full border-collapse border border-gray-300 bg-white"
                : undefined
            }
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },
  
    thead: ({ children, ...props }) => (
      <thead className="bg-gray-50" {...props}>
        {children}
      </thead>
    ),
  
    tbody: ({ children, ...props }) => (
      <tbody className="divide-y divide-gray-300" {...props}>
        {children}
      </tbody>
    ),
  
    tr: ({ children, ...props }) => (
      <tr className="hover:bg-gray-50 transition-colors" {...props}>
        {children}
      </tr>
    ),
  
    th: ({ children, ...props }) => {
      const textContent = getTextContent(children);
      return (
        <th
          className="border border-gray-300 px-4 py-2 text-left font-semibold bg-gray-50"
          {...props}
        >
          <LaTeXRenderer>{textContent}</LaTeXRenderer>
        </th>
      );
    },
  
    td: ({ children, ...props }) => {
      const textContent = getTextContent(children);
      return (
        <td className="border border-gray-300 px-4 py-2" {...props}>
          <LaTeXRenderer>{textContent}</LaTeXRenderer>
        </td>
      );
    },
  
    // Inline elements
    strong: ({ children, ...props }) => (
      <strong className="font-bold" {...props}>
        <MixedFontText>{children}</MixedFontText>
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        <MixedFontText>{children}</MixedFontText>
      </em>
    ),
    del: ({ children, ...props }) => (
      <del className="line-through" {...props}>
        <MixedFontText>{children}</MixedFontText>
      </del>
    ),
    b: ({ children, ...props }) => (
      <b className="font-bold" {...props}>
        <MixedFontText>{children}</MixedFontText>
      </b>
    ),
    a: ({ children, href, title, ...props }) => (
      <a
        href={href}
        title={title}
        className="text-blue-600 hover:text-blue-800 hover:underline"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        {...props}
      >
        <MixedFontText>{children}</MixedFontText>
      </a>
    ),
  
    // Media elements
    img: ({ src, alt, title, ...props }) => (
      <img
        src={src}
        alt={alt || ""}
        title={title}
        loading="lazy"
        className="max-w-full h-auto my-4 rounded-lg shadow-lg"
        {...props}
      />
    ),
  
    code: ({ node, inline, className, children, ...props }) => {
      const isInlineCode =
        inline ||
        (node?.position?.start?.line === node?.position?.end?.line &&
          !className?.includes("language-"));
  
      if (isInlineCode) {
        const extractText = (node) => {
          if (typeof node === "string") return node;
          if (node?.props?.children) return extractText(node.props.children);
          if (Array.isArray(node)) return node.map(extractText).join("");
          return "";
        };
  
        const textContent = extractText(children);
  
        return (
          <span
            className={`${
              isBengaliText(textContent)
                ? notoSerifBengali.className
                : "font-katex-main"
            }
              bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded inline-block align-middle mr-1`}
          >
            {textContent}
          </span>
        );
      }
  
      const match = /language-(\w+)/.exec(className || "");
  
      if (!inline && match) {
        return (
          <div className="my-4 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center bg-gray-100 px-4  text-gray-700  border-gray-200"></div>
            <div className="relative">
              <SyntaxHighlighter
                style={oneLight}
                language={match[1]}
                PreTag="div"
                wrapLines={true}
                wrapLongLines={true}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  borderRadius: 0,
                  whiteSpace: "pre-wrap !important",
                  wordBreak: "break-all",
                  wordWrap: "break-word",
                  lineHeight: 1.5,
                }}
                codeTagProps={{
                  style: {
                    whiteSpace: "pre-wrap !important",
                    wordBreak: "break-all",
                    wordWrap: "break-word",
                  },
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }
  
      return (
        <span
          className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded inline-block align-middle"
          {...props}
        >
          {String(children)}
        </span>
      );
    },
  
    // Definition lists
    dl: ({ children, ...props }) => (
      <dl className="my-4 space-y-4" {...props}>
        {children}
      </dl>
    ),
    dt: ({ children, ...props }) => (
      <dt className="font-bold" {...props}>
        <MixedFontText>{children}</MixedFontText>
      </dt>
    ),
    dd: ({ children, ...props }) => (
      <dd className="ml-4" {...props}>
        <MixedFontText>{children}</MixedFontText>
      </dd>
    ),
  
    // Task lists
    input: ({ type, checked, ...props }) => {
      if (type === "checkbox") {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mr-2 rounded border-gray-300 focus:ring-blue-500"
            {...props}
          />
        );
      }
      return null;
    },
  
    // Horizontal rule
    hr: () => <hr className="my-8 border-t border-gray-300" />,
  
    // Line break
    br: () => <br />,
  };

export default CustomMarkdownComponents;