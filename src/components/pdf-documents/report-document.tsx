import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { useContext } from "react";
import Table from "../table";
import _ from "../utils/lodash";
import FontContext from "../../context/fontFamilies";

const _DEFAULT_MAX_COLS_PER_PAGE = 5;
const _DEFAULT_MAX_ROWS_PER_PAGE = 16;

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
  logoSrc: string;
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
}: IMapReportDocument) => {
  const fontFamilies = useContext(FontContext);

  const rowsData = data.table.rowsData;

  const colNames = data.table.columnNames
    .filter(([, show]) => show)
    .map(([colName]) => colName) as string[];

  const colsNamesChunks = _.chunk(colNames, maxColsPerPage);

  const rowsDataChunks = _.chunk(rowsData, maxRowsPerPage);

  console.log(data.map_1Settings.dataUrl);

  return (
    <Document
      style={{
        fontSize: 12,
        ...(fontFamilies.regular && { fontFamily: fontFamilies.regular }),
      }}
      title={data.title || "گزارش‌گیری"}
    >
      <Page
        size="A4"
        orientation="portrait"
        style={{ padding: 16, display: "flex", gap: "12" }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ width: 24, height: "auto" }}>
            {data.withLogo && <Image src={data.logoSrc} />}
          </View>
          <View>{data.title !== "" && <Text>{data.title}</Text>}</View>
        </View>
        <Image src={data.map_1Settings.dataUrl} />
        <Image src={data.map_2Settings.dataUrl} />
      </Page>
      {colsNamesChunks.map((colNames, ic) => {
        return rowsDataChunks.map((tableData, it) => (
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
