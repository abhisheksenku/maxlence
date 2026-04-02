const User = require("../models/User"); 

const createAdmin = async () => {
  try {
    const adminEmail = "admin@example.com";
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists. Skipping.");
      return;
    }

    console.log("Creating Super Admin...");
    
    // Hooks in your User model (beforeCreate) will handle the bcrypt hashing
    await User.create({
      firstName: "Super",
      lastName: "Admin",
      email: adminEmail,
      password: "Admin@123", 
      role: "admin",
      isVerified: true,
      isActive: true,
    });

    console.log("✅ Admin created successfully: admin@example.com / Admin@123");
  } catch (error) {
    console.error("❌ Error in createAdmin logic:", error);
    throw error;
  }
};

module.exports = createAdmin;