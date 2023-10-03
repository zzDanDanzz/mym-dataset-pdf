import { Font, PDFViewer } from "@react-pdf/renderer";

import { mock as mockReportData } from "./mock-data/mock-report";

import { MyMReportPDF } from "../mym-dataset-pdf";

import { useState } from "react";
import logoSrc from "./assets/logo.png";
import vB from "./fonts/Vazirmatn-Bold.ttf";
import vR from "./fonts/Vazirmatn-Regular.ttf";
import IRANSansXFaNum_Regular from "./fonts/IRANSansXFaNum-Regular.woff";

Font.register({
  family: "Vazirmatn-Regular",
  src: vR,
});

Font.register({
  family: "Vazirmatn-Bold",
  src: vB,
});

Font.register({
  family: "IRANSansXFaNum_Regular",
  src: IRANSansXFaNum_Regular,
});

const textCases = [
  `سلام 1402/02/14  hello سلام`,
  `سلام ۱۴۰۲/۰۲/۱۴ hello سلام`,
  `hello 1402 02 14`,
  `سلام 1402 02 14 hello سلام`,
];

function App() {
  const [textCaseIdx, setTextCaseIdx] = useState(2);

  return (
    <div>
      <div>
        test cases:{" "}
        {textCases.map((tc, i) => {
          const selected = i === textCaseIdx;
          return (
            <button
              key={tc}
              onClick={() => setTextCaseIdx(i)}
              dir="auto"
              style={{
                backgroundColor: selected ? "azure" : "gray",
              }}
            >
              {tc}
            </button>
          );
        })}
      </div>
      <PDFViewer style={{ height: "100vh", width: "100vw" }}>
        <MyMReportPDF
          data={{
            ...mockReportData,
            title: textCases[textCaseIdx],
            logoSrc,
          }}
          fontFamilies={{
            regular: "Vazirmatn-Regular",
            bold: "Vazirmatn-Bold",
            pesianNumbersFont: "IRANSansXFaNum_Regular",
          }}
        />
      </PDFViewer>
    </div>
  );
}

export default App;
