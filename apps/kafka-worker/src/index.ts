require('dotenv').config()
import { PrismaClient } from "@repo/db";
import { JsonObject } from "@repo/db";
import Redis from 'ioredis';
import { parse } from "./parser";
import { sendEmail } from "./email";
import { sendSol } from "./solana";

const prismaClient = new PrismaClient();
const QUEUE_NAME = "zap-events"

const redis = new Redis({
    host: 'localhost',
    port: 6379,
});

async function main() {
    while (true) {
        try {
            // Use BRPOP to wait for and retrieve a message from the queue
            const result = await redis.brpop(QUEUE_NAME, 0);
            
            if (!result) continue;
            
            const [_, message] = result;
            console.log('Received message:', message);

            const parsedValue = JSON.parse(message);
            const zapRunId = parsedValue.zapRunId;
            const stage = parsedValue.stage;

            const zapRunDetails = await prismaClient.zapRun.findFirst({
                where: {
                    id: zapRunId
                },
                include: {
                    zap: {
                        include: {
                            actions: {
                                include: {
                                    type: true
                                }
                            }
                        }
                    },
                }
            });

            const currentAction = zapRunDetails?.zap.actions.find(x => x.sortingOrder === stage);

            if (!currentAction) {
                console.log("Current action not found?");
                continue;
            }

            const zapRunMetadata = zapRunDetails?.metadata;

            if (currentAction.type.id === "email") {
                const body = parse((currentAction.metadata as JsonObject)?.body as string, zapRunMetadata);
                const to = parse((currentAction.metadata as JsonObject)?.email as string, zapRunMetadata);
                const subject = parse((currentAction.metadata as JsonObject)?.subject as string, zapRunMetadata)
                console.log(`Sending out email to ${to} body is ${body}`)
                await sendEmail(to, body, subject);
            }

            if (currentAction.type.id === "send-sol") {
                const amount = parse((currentAction.metadata as JsonObject)?.amount as string, zapRunMetadata);
                const address = parse((currentAction.metadata as JsonObject)?.address as string, zapRunMetadata);
                console.log(`Sending out SOL of ${amount} to address ${address}`);
                await sendSol(address, amount);
            }

            await new Promise(r => setTimeout(r, 500));

            const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1;
            console.log(lastStage);
            console.log(stage);
            if (lastStage !== stage) {
                console.log("pushing back to the queue")
                await redis.lpush(QUEUE_NAME, JSON.stringify({
                    stage: stage + 1,
                    zapRunId
                }));
            }

            console.log("processing done");
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }
}

main()