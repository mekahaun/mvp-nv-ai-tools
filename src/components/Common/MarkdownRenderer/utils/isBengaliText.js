export const isBengaliText = (text) => {
  if (typeof text !== "string") return false;
  const bengaliPattern = /[\u0980-\u09FF]/;
  return bengaliPattern.test(text);
};
