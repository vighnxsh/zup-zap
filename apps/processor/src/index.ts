import { PrismaClient } from "@prisma/client";
import Redis from 'ioredis';

const QUEUE_NAME = "zap-events"

const client = new PrismaClient();

const redis = new Redis({
    host: 'localhost',
    port: 6379,
});

async function main() {
  
    while(true) {
        const pendingRows = await client.zapRunOutbox.findMany({
            where: {},
            take: 10
        });
        console.log(pendingRows);

        if (pendingRows.length > 0) {
            const pipeline = redis.pipeline();

            pendingRows.forEach(r => {
                pipeline.lpush(QUEUE_NAME, JSON.stringify({ zapRunId: r.zapRunId, stage: 0 }));
            });

            await pipeline.exec();

            await client.zapRunOutbox.deleteMany({});
        }

        await new Promise(r => setTimeout(r, 3000));
    }
}

main();