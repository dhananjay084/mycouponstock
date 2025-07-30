import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './congif/db.js';
import dealRoutes from './Routes/dealRoutes.js';
import storeRoutes from './Routes/storeRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import subscriberRoutes from './Routes/subscriberRoutes.js';
import viewRoutes from './Routes/viewRoutes.js';
import blogRoutes from "./Routes/blogRoutes.js";
import adminRoutes from './Routes/homeAdminRoutes.js'

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: "https://homepge.vercel.app/", // replace with your real frontend domain
    credentials: true
  }));
app.use('/api/deals', dealRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api", subscriberRoutes);
app.use('/api/reviews', viewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
