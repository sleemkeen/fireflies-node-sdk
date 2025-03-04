import { TranscriptData } from './types';
import { FirefliesSDK } from './fireflies';

export function generateGraphQLFilter(fields: string[]): string {
    return fields.join(" ");
}

// const fields = ["id", "dateString", "privacy", "speakers { id name }"];

export interface BatchProcessResult {
    meetings: TranscriptData[];
    errors: string[];
}

export class MeetingsHelper {
    private static CONCURRENCY_LIMIT = 5;
    private static DELAY_TIME = 5000;

    private static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async batchProcess(
        tasks: (() => Promise<any>)[],
        apiKey: string
    ): Promise<BatchProcessResult> {
        let index = 0;
        const results: TranscriptData[] = [];
        const errors: string[] = [];

        while (index < tasks.length) {
            const end = Math.min(index + MeetingsHelper.CONCURRENCY_LIMIT, tasks.length);
            console.log(
                `Processing ${index} to ${end} of ${tasks.length} for apiKey: ${apiKey.split('-')[0]}`
            );

            const currentBatch = tasks.slice(index, end).map(task => {
                return task().catch(e => {
                    console.error(`Error processing task at index ${index}: ${e}`);
                    return { errors: [{ code: e.message }] };
                });
            });

            const batchResults = await Promise.all(currentBatch);
            batchResults.forEach(result => {
                if (result?.errors) {
                    errors.push(result.errors[0]?.code);
                } else if (result?.data?.transcript) {
                    results.push(result.data.transcript);
                }
            });

            index += MeetingsHelper.CONCURRENCY_LIMIT;

            if (index < tasks.length) {
                await MeetingsHelper.delay(MeetingsHelper.DELAY_TIME);
            }
        }

        return { meetings: results, errors };
    }

    static async getAllMeetingIds(sdk: FirefliesSDK): Promise<string[]> {
        let skip = 0;
        const limit = 50;
        let hasMore = true;
        let allItems: TranscriptData[] = [];

        while (hasMore) {
            try {
                const items = await sdk.getTranscripts({ limit, skip }, ['id']);

                if (items) {
                    allItems = allItems.concat(items);
                }

                if (!items || items.length < limit) {
                    hasMore = false;
                } else {
                    skip += limit;
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.error("An error occurred while fetching items:", error.message);
                }
                throw error;
            }
        }

        return allItems.map(item => item.id);
    }

    static async getDedeuplicatedMeetingIds(
        apiKeys: string[]
    ): Promise<{ [key: string]: string[] }> {
        const allItems: { [key: string]: string[] } = {};
        const uniqueItems = new Set<string>();

        for (const apiKey of apiKeys) {
            const sdk = new FirefliesSDK({ apiKey });
            const items = await MeetingsHelper.getAllMeetingIds(sdk);
            allItems[apiKey] = items;
            items.forEach(item => uniqueItems.add(item));
        }

        console.log(`Found unique meetings: ${uniqueItems.size}`);

        const deduplicatedItems = Array.from(uniqueItems);
        const result: { [key: string]: string[] } = {};
        const assignedItems = new Set<string>();

        for (const apiKey of apiKeys) {
            result[apiKey] = deduplicatedItems.filter(item => {
                const isInCurrentApiKey = allItems[apiKey].includes(item);
                const isAlreadyAssigned = assignedItems.has(item);
                if (isInCurrentApiKey && !isAlreadyAssigned) {
                    assignedItems.add(item);
                    return true;
                }
                return false;
            });
        }

        return result;
    }

    static async handleOutput(
        result: BatchProcessResult,
        apiKey: string,
        outputType: 'console' | 'json'
    ): Promise<void> {
        if (outputType === 'json') {
            try {
                const fs = require('fs');
                fs.writeFileSync(
                    `RESULTS_${apiKey}.json`,
                    JSON.stringify(result.meetings, null, 2)
                );
                if (result.errors.length > 0) {
                    fs.writeFileSync(
                        `ERRORS_${apiKey}.json`,
                        JSON.stringify(result.errors, null, 2)
                    );
                }
            } catch (e) {
                console.error('Error writing to file:', e);
            }
        } else {
            console.log('Meetings:', result.meetings);
            console.log('Errors:', result.errors);
        }
    }
}