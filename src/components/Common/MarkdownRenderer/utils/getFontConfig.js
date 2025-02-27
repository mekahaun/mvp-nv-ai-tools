import { Noto_Serif_Bengali } from "next/font/google";

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "700"],
  display: "swap",
});

export const getFontConfig = () => {
  return notoSerifBengali;
};
