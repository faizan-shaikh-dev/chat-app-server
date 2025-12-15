import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log("DataBase Connection Sucssess");
        
    } catch (error) {
        console.error("DataBase Connection Faild");
        process.exit(1);
    }
}

export default connectDB;