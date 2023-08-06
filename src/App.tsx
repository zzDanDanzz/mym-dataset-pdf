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

const _MAX_ROWS_PER_PAGE = 8;

const getRowChunks = (
  rows: object[],
  MAX_ROWS_PER_PAGE = _MAX_ROWS_PER_PAGE
) => {
  const chunk = [];
  for (let i = 0; i < rows.length; i += MAX_ROWS_PER_PAGE) {
    chunk.push(rows.slice(i, i + MAX_ROWS_PER_PAGE));
  }
  return chunk;
};

const DatasetTableDocument = ({
  data,
  maxRowsPerPage,
}: {
  data: object[];
  maxRowsPerPage?: number;
}) => {

  // TODO: need column chunks too. calculate pages based on col chunks and row chunks.
  const rowChunks = getRowChunks(data, maxRowsPerPage);

  return (
    <Document style={{ fontFamily: "Vazirmatn-Regular", fontSize: 12 }}>
      {rowChunks.map((rowChunk, i) => {
        return (
          <Page
            size="A4"
            orientation="landscape"
            key={i}
            style={{ padding: 16 }}
          >
            <View style={{ border: 1, borderBottom: 0 }}>
              {rowChunk.map((row) => (
                <Row rowData={row} />
              ))}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

function Row({ rowData }: { rowData: object }) {
  return (
    <View style={{ display: "flex", flexDirection: "row-reverse" }}>
      {Object.values(rowData).map((val) => (
        <View
          style={{
            overflow: "hidden",
            padding: 4,
            width: 100,
            height: 30,
            border: 1,
          }}
        >
          <Text style={{ backgroundColor: "blue" }}>
            {typeof val === "string" || typeof val === "number"
              ? val
              : "not allowed"}
          </Text>
        </View>
      ))}
    </View>
  );
}

function App() {
  return (
    <PDFViewer className={classNames.container}>
      <DatasetTableDocument data={mock} />
    </PDFViewer>
  );
}

export default App;
