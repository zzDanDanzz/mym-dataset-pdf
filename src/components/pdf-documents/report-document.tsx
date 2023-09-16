import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { useContext } from "react";
import FontContext from "../../context/fontFamilies";
import _ from "../utils/lodash";

export interface IMapReportDocument {
  data: IMapReportData;
}

interface IMapReportData {
  map_1Settings: MapSettings;
  map_2Settings: MapSettings;
  mapCoordinates: MapCoordinates;
  withLogo: boolean;
  logoSrc: string;
  title: string;
  table: ITable;
  attachments: AttachmentsInfo;
  baseUrl: string;
  xApiKey: string;
}

interface Attachment {
  mime_type: string;
  extension: string;
  size: number;
  link: string;
  thumbnail_link: string;
  id: number;
}

type AttachmentsInfo = {
  attachmentColNames: string[];
  enabled: boolean;
  selectedColumn: string;
};

type MapCoordinates = {
  lat: number;
  lng: number;
};

interface ITable {
  enabled: boolean;
  columnNames: (boolean | string)[][];
  featuresData: IFeatureData[];
}

type IFeatureData = {
  properties: Record<string, unknown>;
  dataUrls: { map_1: string; map_2: string };
};

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

export const MapReportDocument = ({ data }: IMapReportDocument) => {
  const fontFamilies = useContext(FontContext);

  const colNames = data.table.columnNames
    .filter(([, show]) => show)
    .map(([colName]) => colName) as string[];

  const header = (
    <Header
      {...(data.withLogo && { logoSrc: data.logoSrc })}
      title={data.title}
    />
  );

  const isOmittable = (_: unknown, key: string) => {
    const isAttachment = data.attachments.attachmentColNames.includes(key);
    const isEnabled = colNames.includes(key);
    return isAttachment || !isEnabled;
  };

  // properties without attachments
  const filteredFeaturesData = data.table.featuresData.map((f) => ({
    ...f,
    properties: _.omitBy(f.properties, isOmittable),
  }));

  return (
    <Document
      style={{
        fontSize: 12,
        ...(fontFamilies.regular && { fontFamily: fontFamilies.regular }),
      }}
      title={data.title || "گزارش‌گیری"}
    >
      <Page wrap style={{ padding: 8, paddingBottom: 10 }}>
        {header}
        {filteredFeaturesData.map(({ properties, dataUrls }, i) => {
          const attachmentsImages: React.ReactNode[] | null = (() => {
            try {
              const attchmentKey = data.attachments.selectedColumn;
              const feat = data.table.featuresData[i].properties;
              const stringData = feat[attchmentKey] as string;
              if (!stringData) {
                return null;
              }
              const parsed = JSON.parse(stringData) as Attachment[];
              const slice = parsed.slice(0, 2);
              const { baseUrl, xApiKey } = data;

              return slice.map((attachment, i) => (
                <Image
                  key={i}
                  source={`${baseUrl}${attachment.link}?x-api-key=${xApiKey}`}
                  style={{ maxHeight: 300, maxWidth: 300 }}
                />
              ));
            } catch (error) {
              console.dir("Error getting attachment data", error);
              return null;
            }
          })();

          return (
            <View
              key={i}
              break={i !== 0}
              style={{ gap: 8, padding: 8, paddingTop: 0 }}
            >
              <View
                style={{
                  flexDirection: "row-reverse",
                  gap: 8,
                  flexWrap: "wrap",
                  border: 1,
                  borderRadius: 10,
                  padding: 8,
                }}
              >
                {Object.entries(properties).map(([key, value]) => {
                  return (
                    <View
                      key={key}
                      style={{
                        flexDirection: "row-reverse",
                        backgroundColor: "#dedede",
                        gap: 4,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row-reverse",
                          fontFamily: fontFamilies.bold,
                        }}
                      >
                        <Text>{key}</Text>
                        <Text>:</Text>
                      </View>
                      <Text>{String(value)}</Text>
                    </View>
                  );
                })}
              </View>
              <Image src={dataUrls.map_1} style={{ width: "100%" }} />
              <Image src={dataUrls.map_2} style={{ width: "100%" }} />
              <View
                style={{
                  flexDirection: "row-reverse",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                {attachmentsImages}
              </View>
            </View>
          );
        })}
        <Text
          fixed
          style={{ position: "absolute", right: 10, bottom: 10 }}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

function Header({ logoSrc, title }: { logoSrc?: string; title?: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 8,
      }}
      fixed
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
