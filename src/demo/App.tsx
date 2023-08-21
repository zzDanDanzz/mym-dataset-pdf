import { Font, PDFViewer } from "@react-pdf/renderer";
import vB from "./fonts/Vazirmatn-Bold.ttf";
import vR from "./fonts/Vazirmatn-Regular.ttf";
import { mock } from "./mock";
import { MyMDatasetPdf } from "../mym-dataset-pdf";

Font.register({
  family: "Vazirmatn-Regular",
  src: vR,
});

Font.register({
  family: "Vazirmatn-Bold",
  src: vB,
});

function App() {
  return (
    <PDFViewer style={{ height: "100vh", width: "100vw" }}>
      <MyMDatasetPdf
        data={mock}
        fontFamilies={{ regular: "Vazirmatn-Regular", bold: "Vazirmatn-Bold" }}
      />
    </PDFViewer>
  );
}

export default App;
