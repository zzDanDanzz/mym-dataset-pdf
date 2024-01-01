import ReactPDF, {
  Document,
  Image,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import { useContext } from "react";
import FontContext from "../../context/fontFamilies";
import _ from "../utils/lodash";

import {
  digitsArToFa,
  digitsFaToEn,
  hasPersian,
} from "@persian-tools/persian-tools";

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
            <View key={i} break={i !== 0} style={{ gap: 8, paddingTop: 0 }}>
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
          style={{ position: "absolute", right: 10, bottom: 8, fontSize: 10 }}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
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
        flexDirection: "column",
        gap: 12,
      }}
    >
      {groups.map(({ groupName, groupedProperties }, i) => {
        return (
          <View
            key={i}
            style={{
              flexDirection: "column",
              gap: 12,
            }}
          >
            {groupName && (
              <Text
                style={{
                  textAlign: "right",
                  fontSize: 16,
                  fontFamily: fontFamilies.bold,
                  borderBottom: 1,
                }}
              >
                {groupName}
              </Text>
            )}
            {Object.entries(groupedProperties).map(([key, value]) => {
              return <KeyValue key={key} _key={key} value={value} />;
            })}
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
        gap: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row-reverse",
          fontFamily: fontFamilies.bold,
        }}
      >
        <TextNormalized>{_key}</TextNormalized>
        <Text>:</Text>
      </View>
      <TextNormalized>{String(value)}</TextNormalized>
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
  const fontFamilies = useContext(FontContext);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingTop: 6,
        paddingBottom: 12,
        fontFamily: fontFamilies.bold,
      }}
      fixed
    >
      <View style={{ height: 32, width: "auto", padding: 2 }}>
        {logoSrc && <Image src={logoSrc} />}
      </View>
      <TextNormalized style={{ fontSize: 16 }}>{title}</TextNormalized>
    </View>
  );
}

const containsFaNums = (str: string) => {
  str = digitsArToFa(str);
  const persianNumbersRegex = /[\u06F0-\u06F9]+/;
  return persianNumbersRegex.test(str);
};

const TextNormalized = ({
  children,
  ...props
}: React.PropsWithChildren & ReactPDF.TextProps) => {
  const { pesianNumbersFont } = useContext(FontContext);

  const isValidString = typeof children === "string" && children.length > 0;
  if (!isValidString) {
    console.error(
      `From TextNormalized: this is not a valid string: children: ${children}`
    );
    return null;
  }

  const _hasPersian = hasPersian(children, true);

  return (
    <View
      style={{ flexDirection: _hasPersian ? "row-reverse" : "row", gap: 3, flexWrap: 'wrap' }}
    >
      {children.split(" ").map((txt, i) => {
        const _containsFaNums = containsFaNums(txt);
        if (_containsFaNums) {
          txt = digitsFaToEn(txt);
        }

        return (
          <Text
            key={txt + i + children}
            {...props}
            style={{
              ...props.style,
              ...(_containsFaNums &&
                pesianNumbersFont && { fontFamily: pesianNumbersFont }),
            }}
          >
            {txt}
          </Text>
        );
      })}
    </View>
  );
};
