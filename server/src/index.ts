import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import webhookRoutes from "./routes/webhookRoutes";

dotenv.config();

const app = express();

// Log every request that reaches Express
app.use((req, res, next) => {
  console.log(`\n========== ${new Date().toISOString()} ==========`);

  console.log(`${req.method} ${req.originalUrl}`);

  console.log("Headers:");
  console.log(req.headers);

  next();
});

// Clerk webhook MUST receive raw body
app.use("/webhooks/clerk", express.raw({ type: "application/json" }));

// Everything else
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use(helmet());
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

app.use(morgan("common"));

app.use("/webhooks", webhookRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);

const port = Number(process.env.PORT) || 8000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});