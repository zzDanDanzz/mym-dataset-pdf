import { View, Text } from "@react-pdf/renderer";

export default function Table({
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
              return cell ? "true" : "false";
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
