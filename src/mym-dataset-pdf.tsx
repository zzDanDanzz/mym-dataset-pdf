import { Document, Page } from "@react-pdf/renderer";
import { useContext } from "react";
import Table from "./components/table";
import _ from "./components/utils/lodash";
import FontContext, { IFontContext } from "./context/fontFamilies";

const _FIELDS_TO_IGNORE = ["id", "_count", "deleted_at"];
const _MAX_COLS_PER_PAGE = 5;
const _MAX_ROWS_PER_PAGE = 8;

interface IDatasetTableDocument {
  data: object[];
  maxRowsPerPage?: number;
  maxColsPerPage?: number;
  fieldsToIgnore?: string[];
}

const DatasetTableDocument = ({
  data,
  maxRowsPerPage = _MAX_ROWS_PER_PAGE,
  maxColsPerPage = _MAX_COLS_PER_PAGE,
  fieldsToIgnore = _FIELDS_TO_IGNORE,
}: IDatasetTableDocument) => {
  const fontFamilies = useContext(FontContext);

  const cleanData: object[] = _.omit(data, fieldsToIgnore) as object[];

  const _colNames = Object.keys(cleanData[0]);

  const colsNamesChunks = _.chunk(_colNames, maxColsPerPage);

  const tableDataChunks = _.chunk(data, maxRowsPerPage);

  return (
    <Document
      style={{
        fontSize: 12,
        ...(fontFamilies.regular && { fontFamily: fontFamilies.regular }),
      }}
    >
      {colsNamesChunks.map((colNames, ic) => {
        return tableDataChunks.map((tableData, it) => (
          <Page
            size="A4"
            orientation="landscape"
            key={`${ic}-${it}`}
            style={{ padding: 16 }}
          >
            <Table
              tableData={tableData}
              colNames={colNames}
              key={`${ic}-${it}`}
            />
          </Page>
        ));
      })}
    </Document>
  );
};

export default function MyMDatasetPdf({
  fontFamilies,
  ...datasetTableDocument
}: IDatasetTableDocument & {
  fontFamilies: Required<IFontContext>;
}) {
  return (
    <FontContext.Provider
      value={{ regular: fontFamilies.regular, bold: fontFamilies.bold }}
    >
      <DatasetTableDocument {...datasetTableDocument} />
    </FontContext.Provider>
  );
}
