import React from "react";

export interface IFontContext {
  regular?: string;
  bold?: string;
}

const FontContext = React.createContext<IFontContext>({});

export default FontContext;
