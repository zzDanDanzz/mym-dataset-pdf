import {
  Document,
  PDFViewer,
  Page,
  View,
  Text,
  Font,
} from "@react-pdf/renderer";
import vR from "./fonts/Vazirmatn-Regular.ttf";
import vB from "./fonts/Vazirmatn-Bold.ttf";
import classNames from "./App.module.css";
import { mock } from "./mock";
import _ from "./lodash";

// TODO: take these in as props
// const fieldsToIgnore = ["deleted_at", "_count", "id"];

Font.register({
  family: "Vazirmatn-Regular",
  src: vR,
});

Font.register({
  family: "Vazirmatn-Bold",
  src: vB,
});

const _FIELDS_TO_IGNORE = ["id", "_count", "deleted_at"];
const _MAX_COLS_PER_PAGE = 5;
const _MAX_ROWS_PER_PAGE = 8;

const DatasetTableDocument = ({
  data,
  maxRowsPerPage = _MAX_ROWS_PER_PAGE,
  maxColsPerPage = _MAX_COLS_PER_PAGE,
  fieldsToIgnore = _FIELDS_TO_IGNORE,
}: {
  data: object[];
  maxRowsPerPage?: number;
  maxColsPerPage?: number;
  fieldsToIgnore?: string[];
}) => {
  const cleanData: object[] = _.omit(data, fieldsToIgnore) as object[];

  const _colNames = Object.keys(cleanData[0]);

  const colsNamesChunks = _.chunk(_colNames, maxColsPerPage);

  const tableDataChunks = _.chunk(data, maxRowsPerPage);

  return (
    <Document style={{ fontFamily: "Vazirmatn-Regular", fontSize: 12 }}>
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

function Table({
  colNames,
  tableData,
}: {
  tableData: object[];
  colNames: string[];
}) {
  return (
    <>
      <Row values={colNames} bold />
      {tableData.map((rowData: unknown, i) => (
        <Row
          values={colNames.map((colName) => {
            const cell: unknown = (rowData as never)[colName];

            if (typeof cell === "string") {
              return cell;
            }

            if (typeof cell === "number") {
              return cell.toString();
            }

            if (typeof cell === "boolean") {
              return cell ? 'true' : 'false';
            }

            return "Not viewable";
          })}
          key={i}
        />
      ))}
    </>
  );
}

function Row({ values, bold = false }: { values: string[]; bold?: boolean }) {
  return (
    <View style={{ display: "flex", flexDirection: "row-reverse" }}>
      {values.map((val) => (
        <View
          style={{
            overflow: "hidden",
            padding: 4,
            width: "100%",
            height: 30,
            border: 1,
            ...(bold && { backgroundColor: "#c9c9c9" }),
          }}
          key={val}
        >
          <Text
            style={{
              textAlign: "center",
              ...(bold && { fontFamily: "Vazirmatn-Bold" }),
            }}
          >
            {val}
          </Text>
        </View>
      ))}
    </View>
  );
}

function App() {
  return (
    <PDFViewer className={classNames.container}>
      <DatasetTableDocument
        data={mock}
        fieldsToIgnore={_FIELDS_TO_IGNORE}
        maxColsPerPage={_MAX_COLS_PER_PAGE}
        maxRowsPerPage={_MAX_ROWS_PER_PAGE}
      />
    </PDFViewer>
  );
}

export default App;
