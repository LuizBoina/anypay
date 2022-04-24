// function to get currency by the code
exports.getCurrencyByCode = async (code, dbClient) => {
  try {
    const text = `
      SELECT * FROM currencies
      WHERE code = $1
    `;
    const values = [code];
    const { rows } = await dbClient.query({ text, values });
    return rows[0].id;
  } catch (error) {
    console.log("error on get currency", error);
  }
}