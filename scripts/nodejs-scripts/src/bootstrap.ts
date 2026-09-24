import { inspect } from 'node:util';

const normalizeUnknownError = (error: unknown): Error => {
    if (error instanceof Error) {
        return error;
    }

    return new Error(inspect(error, { depth: 5, showHidden: true }));
};

const logStartupError = (error: unknown, origin: string): void => {
    const normalizedError = normalizeUnknownError(error);

    console.error(`[${origin}]`, normalizedError.message);
    if (normalizedError.stack) {
        console.error(normalizedError.stack);
    }
};

process.on('unhandledRejection', (reason) => {
    logStartupError(reason, 'unhandledRejection');
    (process as unknown as { exit: (code?: number) => never }).exit(1);
});

process.on('uncaughtException', (error) => {
    logStartupError(error, 'uncaughtException');
    (process as unknown as { exit: (code?: number) => never }).exit(1);
});

try {
    await import('./app.ts');
} catch (error) {
    logStartupError(error, 'startup');
    (process as unknown as { exit: (code?: number) => never }).exit(1);
}
