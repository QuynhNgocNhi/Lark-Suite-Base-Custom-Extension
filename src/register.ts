import {
  basekit,
  Component,
  ParamType,
} from "@lark-opdev/block-basekit-server-api";
const credentials = require("./credentials.json");
const { SHEET_ID, app_id, app_secret } = credentials;

basekit.addAction({
  formItems: [
    {
      itemId: "tokenGG",
      label: "Your GG Token",
      required: true,
      component: Component.Input,
      componentProps: {
        mode: "textarea",
        placeholder: "Please enter your GG token to continue",
      },
    },
  ],

  // Define run logic
  execute: async function (args, context) {
    const {
      tokenGG = "ya29.c.c0AY_VpZjdUNQXVa4gbRvUCxbhbGCg1WI7xWA16pcjuZZPI-G2jYMqn7nJeN5nqz0M2a1fE29zq_L-ulawNgTDIWeaXhtwjs5t9Y6_pV78MDLgEeUD7p669SY3TKpDLs7RKH-lOAm2mPDml0K4iiv6aV7cXBdOl60PtMieW9ZmWB3KS6NSdf7Z163nJ849y0yYdB3Q9HqbS05IlNHcK4Zp9W43jbPDwhSVijXL-y8RvVRFtxpqlLenueTs2AG5OjRrD_YsaZZxahBOS9GeHbhqDfu2MGUudhyio_Zqq8JwSdrlOJWof3lFuoEBAdPgAzTziknbEOD7KReMKDNPLrJ3SjRkveRhSkFAEJ1u7qcXcgv4KXKYXHSwsQJVkAG387K0U3nZfnz3pux72qtqsXFsc5SmalqiO_zJ_a3Z7FVlQ_VagXwirF0haY6yiidop-haudFUjufQM5qaBytyO0B9kO3m2uhBd2hlsuI-tuzOaFs344gS7X-S54YhyRvbQwqdkV1O4FFIOc6jeXIkMS7hVIYSO79vbrhab0ltOZm48c2ek7-_mxtzki8_scuQOR_Vh80W6z6Z09dqbS8f9SppQ_xsidcgywbVIv7np5SerVsSYV459gBshqpMvgxgrjqrcJbU2uWo-2F6rBZ__p3mqXZSbs2OSwVhn6brX67mtRQWB2M-pdhtW8qQdwwzpBWOt6k80Fgfd65UO8qui-I2YioXe7aU5I72fiS2qlV93kjY4qVo-xMVhV4eUjQ3qYZ2y_cQtWcql53OJnBZte5o59Qjz-_jXjUimxw-zu_flw7Ibt2Z-QYJS3ky5kJsk3rViFhl6WX8a7-M013uW1n8ni_5MbfihkcFzRrm0sx4024rWiZfjgJnjc74tismpytv6rvQ-k0yfUOM4uFW_8tenQM1di73FU_pOYsuS1UFkvF5t4iUnyhtpq4107zYnxfvpWWhyxUZSVbra6qlh0YW2fJ8z28o2-Z9Qy27O7BVcdSoaUVvYUr60I9",
    } = args;
    const { fetch } = context;
    const baseToken = context.app.token;
    const recordID = context.app.trigger.recordID;
    const tableID = context.app.trigger.tableID;

    let result;
    const updateGoogleSheet = async (convertedData) => {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1%21A1:append?valueInputOption=RAW`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenGG}`,
          },
          body: JSON.stringify(convertedData),
        }
      )
        .then(async (response) => {
          const data = await response.json();

          result = data.tableRange;
        })
        .catch((error) => {
          console.log("error", error);
          return "error";
        });
    };
    const getRecord = async (larkAccessToken) => {
      const baseAppId = baseToken || "R73FbEKDbaY6QPsgvuhlEqRRgX4";
      const tableId = tableID || "tblnTsXk6D2spj1u";
      const recordId = recordID || "recqxUyCfM";
      const response = await fetch(
        `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseAppId}/tables/${tableId}/records/${recordId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${larkAccessToken}`,
          },
        }
      )
        .then(async (response) => {
          const responseJson = await response.json();

          return responseJson.data.record.fields;
        })
        .catch((error) => {
          console.log("error", error);
          return "error";
        });
      return response;
    };

    function convertDataForGoogleSheets(recordValues) {
      const id = recordValues.ID;
      const datePayment = new Date(recordValues["Date Payment"]);
      const formattedDatePayment = `${
        datePayment.getMonth() + 1
      }/${datePayment.getDate()}/${datePayment.getFullYear()}`;
      const deliveryAddress = recordValues["Delivery address"]
        ? recordValues["Delivery address"].full_address
        : "";
      const email =
        recordValues.Email && recordValues.Email.length > 0
          ? recordValues.Email[0].text
          : "";
      const phone = recordValues.Phone[0].fullPhoneNum;
      const dealName =
        recordValues["Deal's Name"] && recordValues["Deal's Name"].length > 0
          ? recordValues["Deal's Name"][0].text
          : "";
      const productName =
        recordValues.Product && recordValues.Product.length > 0
          ? recordValues.Product[0].text
          : "";
      const quantity =
        recordValues.Quantity && recordValues.Quantity.length > 0
          ? recordValues.Quantity[0].text
          : "";
      const responsibleName =
        recordValues.Responsible && recordValues.Responsible.length > 0
          ? recordValues.Responsible[0].name
          : "";
      const totalMoney = recordValues["Total money"] || "";
      const totalPayment = recordValues["Total payment"] || "";
      const unitPrice =
        recordValues["Unit Price"] && recordValues["Unit Price"].length > 0
          ? recordValues["Unit Price"][0]
          : "";
      const payMethod = recordValues["Payment methods"];
      const voucher = recordValues["Voucher"];
      const shipping = recordValues["Shipping"];
      const values = [
        [
          id,
          responsibleName,
          formattedDatePayment,
          dealName,
          email,
          phone,
          productName,
          quantity,
          unitPrice,
          voucher,
          shipping,
          totalMoney,
          totalPayment,
          payMethod,
          deliveryAddress,
        ],
      ];

      return { values };
    }
    const getLarkAccessToken = async () => {
      var raw = JSON.stringify({
        app_id,
        app_secret,
      });

      const response = await fetch(
        `https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: raw,
        }
      )
        .then(async (response) => {
          const responseJson = await response.json();

          return responseJson.tenant_access_token;
        })
        .catch((error) => {
          console.log("error", error);
          return "error";
        });
      return response;
    };

    const larkAccessToken = await getLarkAccessToken();

    const recordValues = await getRecord(larkAccessToken);

    const convertedData = convertDataForGoogleSheets(recordValues);

    const required = await updateGoogleSheet(convertedData);

    return {
      text: result,
    };
  },

  resultType: {
    type: ParamType.Object,
    properties: {
      text: {
        type: ParamType.String,
        label: "Location Exported Data",
      },
    },
  },
});

export default basekit;
