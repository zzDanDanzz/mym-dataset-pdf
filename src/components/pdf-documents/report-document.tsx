import {
  Document,
  Image,
  Page,
  Path,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
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

type GroupingData = { groupName: string | null; fields: string[] }[];

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
  groupingData: GroupingData;
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

  const isOmittable = (_: unknown, key: string) => {
    const isAttachment = data.attachments.attachmentColNames.includes(key);
    const isDisabled = !colNames.includes(key);
    return isAttachment || isDisabled;
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
      <Page wrap style={{ padding: 12, paddingBottom: 20 }}>
        <Header
          {...(data.withLogo && { logoSrc: data.logoSrc })}
          title={data.title}
        />
        {filteredFeaturesData.map(({ properties, dataUrls }, i) => {
          return (
            <View
              key={i}
              break={i !== 0}
              style={{ gap: 8, paddingTop: 0 }}
            >
              {data.table.enabled && (
                <KeysAndValues
                  properties={properties}
                  groupingData={data.table.groupingData}
                />
              )}
              {data.map_1Settings.enabled && (
                <Image
                  src={dataUrls.map_1}
                  style={{ width: "100%", borderRadius: 8 }}
                />
              )}
              {data.map_2Settings.enabled && (
                <Image
                  src={dataUrls.map_2}
                  style={{ width: "100%", borderRadius: 8 }}
                />
              )}
              <AttachmentImages data={data} index={i} />
            </View>
          );
        })}
        <Text
          fixed
          style={{ position: "absolute", right: 10, bottom: 6, fontSize: 10 }}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

const FolderSVG = () => {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <Path
        d="M14 12.1481C14 12.4625 13.8736 12.7639 13.6485 12.9862C13.4235 13.2085 13.1183 13.3333 12.8 13.3333H3.2C2.88174 13.3333 2.57652 13.2085 2.35147 12.9862C2.12643 12.7639 2 12.4625 2 12.1481V3.85185C2 3.53752 2.12643 3.23607 2.35147 3.0138C2.57652 2.79154 2.88174 2.66667 3.2 2.66667H6.2L7.4 4.44445H12.8C13.1183 4.44445 13.4235 4.56931 13.6485 4.79158C13.8736 5.01384 14 5.3153 14 5.62963V12.1481Z"
        stroke="#667085"
        strokeWidth="1.5"
        strokeLineCap="round"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        strokeLinejoin="round"
      />
    </Svg>
  );
};

function KeysAndValues({
  properties,
  groupingData,
}: {
  properties: Record<string, unknown>;
  groupingData: GroupingData;
}) {
  const fontFamilies = useContext(FontContext);

  const groups = (() => {
    return groupingData.map(({ groupName, fields }) => {
      const groupedProperties: Record<string, unknown> = {};
      Object.entries(properties).forEach(([k, v]) => {
        if (fields.includes(k)) {
          groupedProperties[k] = v;
        }
      });
      return {
        groupName,
        groupedProperties,
      };
    });
  })();

  return (
    <View
      style={{
        border: 1,
        borderRadius: 8,
        borderColor: "#D0D5DD",
        padding: 8,
        flexDirection: "column",
        gap: 12,
      }}
    >
      {groups.map(({ groupName, groupedProperties }, i) => {
        return (
          <View key={i}>
            {groupName && (
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <FolderSVG />
                <Text
                  style={{
                    textAlign: "right",
                    fontSize: 13,
                    color: "#667085",
                    fontFamily: fontFamilies.bold,
                  }}
                >
                  {groupName}
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: "row-reverse",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {Object.entries(groupedProperties).map(([key, value]) => {
                return <KeyValue key={key} _key={key} value={value} />;
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function KeyValue({ _key, value }: { _key: string; value: unknown }) {
  const fontFamilies = useContext(FontContext);

  return (
    <View
      style={{
        flexDirection: "row-reverse",
        backgroundColor: "#EDEDED",
        gap: 4,
        padding: 4,
        borderRadius: 6,
      }}
    >
      <View
        style={{
          flexDirection: "row-reverse",
          fontFamily: fontFamilies.bold,
        }}
      >
        <Text>{_key}</Text>
        <Text>:</Text>
      </View>
      <Text>{String(value)}</Text>
    </View>
  );
}

function AttachmentImages({
  data,
  index,
}: IMapReportDocument & { index: number }) {
  const attachmentImages = (() => {
    try {
      const { attachments } = data;

      // if disabled attachments or there are no attachment cols
      if (!attachments.enabled || attachments.selectedColumn.length === 0) {
        return null;
      }

      const attchmentKey = attachments.selectedColumn;
      const featureProperties = data.table.featuresData[index].properties;
      const stringData = featureProperties[attchmentKey] as string;

      if (!stringData) {
        return null;
      }

      const parsed = JSON.parse(stringData) as Attachment[];
      const imagesOnly = parsed.filter((a) => a.mime_type.includes("image"));
      const slice = imagesOnly.slice(0, 2);
      const { baseUrl, xApiKey } = data;

      return slice.map((image) => (
        <Image
          key={image.id}
          source={`${baseUrl}${image.link}?x-api-key=${xApiKey}`}
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
      style={{
        flexDirection: "row-reverse",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      {attachmentImages}
    </View>
  );
}

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
