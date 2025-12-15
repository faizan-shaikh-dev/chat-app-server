import User from "../models/user.Model.js";
import bcrypt from "bcryptjs";
import { genSalt } from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";


export const userRegister = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Account already registered with this Phone Number" });
    }

    const salt = await genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      password: hashedPassword,
      phone,
    });

    return res.status(201).json({
      message: "User Register Successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error({ message: `Internal Server Error: ${error}` });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if ((!phone, !password)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "Invalid Phone Number" });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({ message: "Invalid Crdentials" });
    }

    const payload = {
      id: user._id,
      phone: user.phone,
      name: user.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged In Scccessfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        accessToken,
      },
    });
  } catch (error) {
    console.error({ message: `Internal Server Error: ${error}` });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Token Not Provided" });
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Inavlid RefreshToken" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or Expired Token" });
      }
    });

    const newRefreshToken = generateRefreshToken({user: user._id});
    user.refreshToken = refreshToken;
    user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 1000,
    });

    const accessToken = generateAccessToken({user: user._id});
    return res.json({ accessToken });
  } catch (error) {
    console.error({ message: `internal Server Error: ${error}` });
    return res.status(500).json({error})
  }
};

export const logout = async (req, res)=>{
    try {
        const {refreshToken} = req.cookies;

        if (refreshToken) {
            await User.updateOne(
                {refreshToken}, {$set: {refreshToken: null}}
            );
        }

        res.clearCookie("refreshToken");

        res.status(200).json({message: "Logged Out Successfully"});
    } catch (error) {
        console.error({message: `Internal Server Error: ${error}`});
        
    }
};