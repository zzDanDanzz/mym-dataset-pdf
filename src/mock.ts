const mockCol = {
  col1_key: "col1_val",
  col2_key: "col2_val",
  col3_key: "col3_val",
  col4_key: "col4_val",
  col5_key: "col5_val",
  col6_key: "col6_val",
  col7_key: "col7_val",
  col8_key: "col8_val",
  col9_key: "col9_val",
  col10_key: "col10_val",
  col11_key: "col11_val",
  col12_key: "col12_val",
  col13_key: "col13_val",
  col14_key: "col14_val",
  col15_key: "col15_val",
  col16_key: "col16_val",
  col17_key: "col17_val",
  col18_key: "col18_val",
  col19_key: "col19_val",
  col20_key: "col20_val",
};

const array = [];

for (let i = 1; i <= 10; i++) {
  const obj = {};

  for (const key in mockCol) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    obj[key] = mockCol[key] + "_item_" + i;
  }

  array.push(obj);
}

console.log("🚀 ~ array", array)


export const mock = array
