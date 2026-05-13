import mongoose from 'mongoose';

const connectDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');
};

export default connectDatabase;