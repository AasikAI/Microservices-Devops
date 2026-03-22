const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./products_db.sqlite",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("[Product Service] SQLite connected successfully.");
  } catch (error) {
    console.error(`[Product Service] SQLite connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
