import { getFontConfig } from "./utils/getFontConfig";
import { isBengaliText } from "./utils/isBengaliText";
import React from "react";

const notoSerifBengali = getFontConfig();

const MixedFontText = ({ children }) => {
  // Handle string content
  if (typeof children === "string") {
    const words = children.split(/(\s+)/);
    let result = [];
    let currentGroup = [];
    let isCurrentlyNonBengali = false;

    const flushGroup = () => {
      if (currentGroup.length > 0) {
        if (isCurrentlyNonBengali) {
          result.push(
            <span key={result.length} className="font-katex-main">
              {currentGroup.join("")}
            </span>
          );
        } else {
          result.push(currentGroup.join(""));
        }
        currentGroup = [];
      }
    };

    words.forEach((word, index) => {
      if (word.trim() === "") {
        currentGroup.push(word);
        return;
      }

      const isNonBengali = !isBengaliText(word);

      // If we're switching between Bengali and non-Bengali, flush the current group
      if (isNonBengali !== isCurrentlyNonBengali) {
        flushGroup();
        isCurrentlyNonBengali = isNonBengali;
      }

      currentGroup.push(word);
    });

    // Flush any remaining words
    flushGroup();

    return <span className={notoSerifBengali.className}>{result}</span>;
  }

  // Handle array of children
  if (Array.isArray(children)) {
    return (
      <span className={notoSerifBengali.className}>
        {children.map((child, index) => (
          <MixedFontText key={index}>{child}</MixedFontText>
        ))}
      </span>
    );
  }

  // Handle React elements
  if (children && typeof children === "object" && "type" in children) {
    // Skip wrapping for KaTeX elements
    if (
      children.props?.className?.includes("katex") ||
      children.type?.toString().includes("katex")
    ) {
      return children;
    }

    // For normal elements, wrap with appropriate font class
    const className = children.props?.className || "";

    return React.cloneElement(children, {
      ...children.props,
      className: `${className} ${notoSerifBengali.className}`.trim(),
      children: <MixedFontText>{children.props.children}</MixedFontText>,
    });
  }

  return children;
};

export default MixedFontText;
