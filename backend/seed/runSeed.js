// Destructure sequelize because your file exports { sequelize, connectDB }
const { sequelize } = require("../config/database"); 
const createAdmin = require("./createAdmin");

const runSeed = async () => {
  try {
    console.log("🌱 Starting Database Seeding...");

    // Now this will work because we destructured it
    await sequelize.authenticate(); 
    console.log("🔗 Database connection established.");

    await createAdmin();

    console.log("🏁 Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("💥 Critical error during seeding:", err);
    process.exit(1);
  }
};

runSeed();