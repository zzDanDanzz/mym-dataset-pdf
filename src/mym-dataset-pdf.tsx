import {
  DatasetTableDocument,
  IDatasetTableDocument,
} from "./components/pdf-documents/dataset-table-document";
import {
  IMapReportDocument,
  MapReportDocument,
} from "./components/pdf-documents/report-document";
import FontContext, { IFontContext } from "./context/fontFamilies";

export function MyMDatasetPdf({
  fontFamilies,
  ...datasetTableDocument
}: IDatasetTableDocument & {
  fontFamilies: IFontContext;
}) {
  return (
    <FontContext.Provider
      value={{ regular: fontFamilies.regular, bold: fontFamilies.bold }}
    >
      <DatasetTableDocument {...datasetTableDocument} />
    </FontContext.Provider>
  );
}

export function MyMReportPDF({
  fontFamilies,
  ...mapReportDocument
}: IMapReportDocument & {
  fontFamilies: IFontContext;
}) {
  return (
    <FontContext.Provider value={{ ...fontFamilies }}>
      <MapReportDocument {...mapReportDocument} />
    </FontContext.Provider>
  );
}
