import { Text, View } from "@react-pdf/renderer";
import { useContext } from "react";
import FontContext from "../context/fontFamilies";

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
  const fontFamilies = useContext(FontContext);

  const fontSize = bold
    ? fontFamilies.sizes?.bold || 12
    : fontFamilies.sizes?.regular || 10;

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
              fontSize,
              ...(bold &&
                fontFamilies.bold && { fontFamily: fontFamilies.bold }),
            }}
          >
            {val}
          </Text>
        </View>
      ))}
    </View>
  );
}
