const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "1h"; 

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  const startTime = Date.now();
  console.log("Received signup request");

  try {
    console.log("Checking for existing user...");
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log("User already exists.");
      return res.status(400).json({
        success: false,
        error: "User already exists. Please login or use a different email.",
      });
    }

    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    console.log("Saving new user to database...");
    await newUser.save();

    const payload = { userId: newUser._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    console.log(`Signup process took ${Date.now() - startTime} ms`);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Error during signup: ", error.message);
    res.status(500).json({
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    
    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials. Please check your email and password.",
      });
    }

    // Compare entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials. Please check your email and password.",
      });
    }

    // Generate JWT token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    // Respond with the token and success message
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error during login: ", error.message);
    res.status(500).json({
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    return res.status(500).json({
      success: false,
      message: "Server error, unable to fetch users",
      error: error.message, 
    });
  }
};
