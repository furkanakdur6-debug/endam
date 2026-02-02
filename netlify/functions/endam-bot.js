exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "POST only" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ reply: "Merhaba 💗 Endam Bot buradayım." }),
  };
};
