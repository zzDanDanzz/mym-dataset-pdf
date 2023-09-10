/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { useContext } from "react";
import FontContext from "../../context/fontFamilies";
import Table from "../table";
import _ from "../utils/lodash";

const _DEFAULT_MAX_COLS_PER_PAGE = 5;
const _DEFAULT_MAX_ROWS_PER_PAGE = 16;

export interface IMapReportDocument {
  data: IMapReportData;
  maxRowsPerPage?: number;
  maxColsPerPage?: number;
  fieldsToIgnore?: string[];
}

interface IMapReportData {
  map_1Settings: MapSettings;
  map_2Settings: MapSettings;
  withLogo: boolean;
  logoSrc: string;
  title: string;
  table: Table;
}

interface Table {
  enabled: boolean;
  columnNames: (boolean | string)[][];
  rowsData: {
    properties: Record<string, unknown>;
    dataUrl: { map_1: string; map_2: string };
  }[];
}

interface MapSettings {
  enabled: boolean;
  title: string;
  showTitle: boolean;
  withCoordinates: boolean;
  style: Style;
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

  // const rowsData = data.table.rowsData.properties;

  const colNames = data.table.columnNames
    .filter(([, show]) => show)
    .map(([colName]) => colName) as string[];

  const colsNamesChunks = _.chunk(colNames, maxColsPerPage);

  // const rowsDataChunks = _.chunk(rowsData, maxRowsPerPage);

  const header = (
    <Header
      {...(data.withLogo && { logoSrc: data.logoSrc })}
      title={data.title}
    />
  );

  return (
    <Document
      style={{
        fontSize: 12,
        ...(fontFamilies.regular && { fontFamily: fontFamilies.regular }),
      }}
      title={data.title || "گزارش‌گیری"}
    >
      {/* {data.table.enabled &&
        colsNamesChunks.map((colNames, ic) => {
          return rowsDataChunks.map((tableData, it) => (
            <Page
              size="A4"
              orientation="landscape"
              key={`${ic}-${it}`}
              style={{ padding: 16, display: "flex", gap: "12" }}
            >
              {header}
              <View>
                <Table
                  tableData={tableData}
                  colNames={colNames}
                  key={`${ic}-${it}`}
                />
              </View>
            </Page>
          ));
        })} */}

      {data.table.rowsData.map((rd, i) => {
        return (
          <Page
            size="A4"
            orientation="landscape"
            style={{
              padding: 16,
              display: "flex",
              gap: "12",
              alignItems: "center",
            }}
            key={i}
          >
            {header}
            <Text>RD {i}</Text>
            <Image src={rd.dataUrl.map_1} style={{ width: 550 }} />
            <Image src={rd.dataUrl.map_2} style={{ width: 550 }} />
          </Page>
        );
      })}
      {/* {data.map_1Settings.enabled && (
          <Image src={data.map_1Settings.dataUrl} style={{ width: 550 }} />
        )}
        {data.map_2Settings.enabled && (
          <Image src={data.map_2Settings.dataUrl} style={{ width: 550 }} />
        )} */}
    </Document>
  );
};

function Header({ logoSrc, title }: { logoSrc?: string; title?: string }) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <View style={{ width: 24, height: "auto" }}>
        {logoSrc && <Image src={logoSrc} />}
      </View>
      <View>
        {typeof title === "string" && title.length > 0 && <Text>{title}</Text>}
      </View>
    </View>
  );
}
