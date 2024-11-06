import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/admin/taskRoutes.js";
import groupRoutes from "./routes/admin/groupRoutes.js";
import memberRoutes from "./routes/admin/memberRoutes.js";
import projectRoutes from "./routes/admin/projectRoutes.js";
import DashboardMemberRoutes from './routes/member/DashboardMemberRoutes.js'

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/groups", groupRoutes);

app.use("/api/members", memberRoutes);
app.use('/api', DashboardMemberRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Serveur connecté à http://localhost:${port}`);
});
