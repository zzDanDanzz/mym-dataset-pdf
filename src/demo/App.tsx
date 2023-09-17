import { Font, PDFViewer } from "@react-pdf/renderer";

import { mock as mockDatasetPdfData } from "./mock-data/mock-datasets";
import { mock as mockReportData } from "./mock-data/mock-report";

import { MyMDatasetPdf, MyMReportPDF } from "../mym-dataset-pdf";

import vB from "./fonts/Vazirmatn-Bold.ttf";
import vR from "./fonts/Vazirmatn-Regular.ttf";
import { useState } from "react";
import logoSrc from "./assets/logo.png";

Font.register({
  family: "Vazirmatn-Regular",
  src: vR,
});

Font.register({
  family: "Vazirmatn-Bold",
  src: vB,
});

const pages = {
  datasets: () => (
    <MyMDatasetPdf
      data={mockDatasetPdfData}
      fontFamilies={{ regular: "Vazirmatn-Regular", bold: "Vazirmatn-Bold" }}
    />
  ),
  report: () => (
    <MyMReportPDF
      data={{
        ...mockReportData,
        logoSrc,
        table: {
          ...mockReportData.table,
          groupingData: [
            {
              groupName: "group 1",
              fields: [
                "user_id",
                "مانده مطالبات معوق",
                "مانده ی جاری سپرده ها",
              ],
            },
            {
              groupName: "group 2",
              fields: ["ستون_ژئومتری", "geometry"],
            },
            {
              groupName: null,
              fields: ["کدپستی", "نام بانک", "تلفن", "شعبه"],
            },
          ],
        },
      }}
      fontFamilies={{ regular: "Vazirmatn-Regular", bold: "Vazirmatn-Bold" }}
    />
  ),
} as const;

type IPages = keyof typeof pages;

function App() {
  const [page, setPage] = useState<IPages | null>("report");

  const pagesData = Object.entries(pages);
  const pageComponent = page !== null ? pages[page]() : null;

  return (
    <div>
      {page === null &&
        pagesData.map(([pageName]) => (
          <button onClick={() => setPage(pageName as IPages)} key={pageName}>
            {pageName}
          </button>
        ))}
      {pageComponent && (
        <PDFViewer style={{ height: "100vh", width: "100vw" }}>
          {pageComponent}
        </PDFViewer>
      )}
    </div>
  );
}

export default App;
