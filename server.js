import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/taskRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import memberRoutes from './routes/memberRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

app.use('/api/tasks', taskRoutes);

app.use('/api/projects', projectRoutes);

app.use('/api/groups', groupRoutes);

app.use('/api/members', memberRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Serveur connecté à http://localhost:${port}`);
});
