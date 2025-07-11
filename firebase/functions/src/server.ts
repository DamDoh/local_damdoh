
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Simple test route to confirm the service is running
app.get('/', (req: Request, res: Response) => {
  res.status(200).send({ status: 'OK', message: 'DamDoh AI Service is running.' });
});

// TODO: Migrate AI Cloud Functions to this server as dedicated endpoints.
// Example:
// import { assessCreditRiskWithAI } from './ai-and-analytics';
// app.post('/ai/assess-risk', async (req: Request, res: Response) => {
//   // Add authentication and validation middleware here
//   try {
//     const result = await assessCreditRiskWithAI(req.body);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error('Error assessing credit risk:', error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

app.listen(port, () => {
  console.log(`DamDoh AI Service listening on port ${port}`);
});

export default app;
