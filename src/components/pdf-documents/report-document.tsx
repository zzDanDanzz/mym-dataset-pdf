import { Document, Page } from "@react-pdf/renderer";
import { useContext } from "react";
import Table from "../table";
import _ from "../utils/lodash";
import FontContext from "../../context/fontFamilies";

const _DEFAULT_FIELDS_TO_IGNORE = ["id", "_count", "deleted_at"];
const _DEFAULT_MAX_COLS_PER_PAGE = 5;
const _DEFAULT_MAX_ROWS_PER_PAGE = 8;

export interface IMapReportDocument {
  data: IMapReportData;
  maxRowsPerPage?: number;
  maxColsPerPage?: number;
  fieldsToIgnore?: string[];
}

interface IMapReportData {
  map_1Settings: Map1Settings;
  map_2Settings: Map1Settings;
  withLogo: boolean;
  title: string;
  table: Table;
}

interface Table {
  enabled: boolean;
  columnNames: (boolean | string)[][];
  rowsData: Record<string, unknown>[];
}

interface Map1Settings {
  enabled: boolean;
  title: string;
  showTitle: boolean;
  withCoordinates: boolean;
  style: Style;
  dataUrl: string;
}

interface Style {
  type: string;
  source: string;
}

export const MapReportDocument = ({
  data,
  maxRowsPerPage = _DEFAULT_MAX_ROWS_PER_PAGE,
  maxColsPerPage = _DEFAULT_MAX_COLS_PER_PAGE,
  fieldsToIgnore = _DEFAULT_FIELDS_TO_IGNORE,
}: IMapReportDocument) => {
  const fontFamilies = useContext(FontContext);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const cleanData: object[] = data.map((row) =>
    _.omit(row, fieldsToIgnore)
  ) as object[];

  const _colNames = Object.keys(cleanData[0]);

  const colsNamesChunks = _.chunk(_colNames, maxColsPerPage);

  const tableDataChunks = _.chunk(cleanData, maxRowsPerPage);

  return (
    <Document
      style={{
        fontSize: 12,
        ...(fontFamilies.regular && { fontFamily: fontFamilies.regular }),
      }}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      title={title}
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
