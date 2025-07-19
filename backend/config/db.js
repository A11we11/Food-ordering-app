import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://3z3:kingeze123@cluster0.r1nhvac.mongodb.net/quikbite "
    )
    .then(() => console.log("DB Connected"));
};
