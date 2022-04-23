const { v4: uuidv4 } = require('uuid');

const createTables = async (client) => {
  try {
    const createTableStr = `  
      CREATE TABLE IF NOT EXISTS currencies
      ( id UUID PRIMARY KEY,
        "currentValue" NUMERIC(2) NOT NULL,
        name VARCHAR(20) NOT NULL,
        code VARCHAR(10) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS currenciesHistory
      ( id UUID PRIMARY KEY,
        date DATE NOT NULL,
        value NUMERIC(2) NOT NULL,
        "currencyId" UUID NOT NULL,
        CONSTRAINT "currenciesHistory"
        FOREIGN KEY("currencyId")
          REFERENCES currencies(id)
      );

      CREATE TABLE IF NOT EXISTS users
      ( id UUID PRIMARY KEY,
        username VARCHAR(25) NOT NULL,
        password VARCHAR(60) NOT NULL,
        email VARCHAR(50) NOT NULL,
        birthday DATE NOT NULL,
        document VARCHAR(50) NOT NULL,
        "principalCurrency" UUID NOT NULL,
        phonenumber VARCHAR(20) NOT NULL,
        CONSTRAINT "userPrincipalCurrencies"
        FOREIGN KEY("principalCurrency")
          REFERENCES currencies(id)
      );

      CREATE TABLE IF NOT EXISTS transactions
      ( id UUID PRIMARY KEY,
        currency INT NOT NULL,
        type VARCHAR(20),
        "isSucceed" BOOLEAN NOT NULL,
        "isExchange" BOOLEAN NOT NULL,
        "userId" UUID NOT NULL,
        "destinyName" VARCHAR(60),
        "destinyId" UUID,
        CONSTRAINT "userTransactionsUsers"
          FOREIGN KEY("userId")
            REFERENCES users(id),
        CONSTRAINT "userTransactionsCurrencies"
          FOREIGN KEY("userId")
            REFERENCES currencies(id)
      );

      CREATE TABLE IF NOT EXISTS "walletCurrencies"
      ( id UUID PRIMARY KEY,
        "userId" UUID NOT NULL,
        "currencyId" UUID NOT NULL,
        amount NUMERIC(2) NOT NULL,
        "transactionId" UUID NOT NULL,
        CONSTRAINT "walletCurrenciesCurrencies"
          FOREIGN KEY("currencyId")
            REFERENCES currencies(id),
        CONSTRAINT "walletCurrenciesUsers"
          FOREIGN KEY("userId")
            REFERENCES users(id),
        CONSTRAINT "walletCurrenciesTransations"
          FOREIGN KEY("transactionId")
            REFERENCES transactions(id)          
      );
    `
    const result = await client.query(createTableStr);
  } catch (error) {
    console.log("error on creating tables ", error.stack)
  }
}

const createCurrencies = async (client) => {
  // try {
  //   const createTableStr = `  
  //   INSERT INTO currencies
  //   (id, "currentValue", name, code)
  //   VALUES('f6a16ff7-4a31-11eb-be7b-8344edc8f36b', 0, 'US Dollar', 'USD');
  //   INSERT INTO currencies
  //   (id, "currentValue", name, code)
  //   VALUES("f6a16ff7-4a31-11eb-be7b-8344edc8576b", 5.67, "Real", "BRL");
  //   `
  //   const result = await client.query(createTableStr);
  // } catch (error) {
  //   console.log("error on creating tables ", error.stack)
  // }
}

exports.runMigrations = async (req, res) => {
  if (process.env.ENVIRONMENT === "development") {
    const { dbClient } = req;
    await createTables(dbClient);
    await createCurrencies(dbClient);
  }
}