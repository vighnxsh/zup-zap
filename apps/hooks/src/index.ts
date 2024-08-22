import express from 'express';
import { PrismaClient } from '@repo/db';
 
const client = new PrismaClient();
const app = express();

app.use(express.json());
app.post('/hooks/catch/:userId/:zapId', async (req, res) => {
   
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;




    await client.$transaction(async (tx) => {
       const run =  await tx.zapRun.create({
            data: {
                zapId: zapId,
                metadata: body
            }
        });
        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id
            }
        })
    })

res.json({
    message: 'Zap run created'
})



});

const PORT = process.env.PORT || 5000;
app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
});
