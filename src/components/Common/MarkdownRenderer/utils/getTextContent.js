export const getTextContent = (children) => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map((child) => getTextContent(child)).join("");
  }
  if (children?.props?.children) {
    return getTextContent(children.props.children);
  }
  return String(children || "");
};
