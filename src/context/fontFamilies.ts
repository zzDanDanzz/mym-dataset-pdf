import React from "react";

export interface IFontContext {
  regular: string;
  bold: string;
  sizes?: {
    regular: number,
    bold: number
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const FontContext = React.createContext<IFontContext>({});

export default FontContext;
