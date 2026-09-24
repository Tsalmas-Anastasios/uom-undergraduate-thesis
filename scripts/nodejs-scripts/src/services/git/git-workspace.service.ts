import { execFile, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const sanitizeSegment = (value: string): string =>
    value
        .toLowerCase()
        .replaceAll(/[^a-z0-9._-]+/g, '-')
        .replaceAll(/^-+|-+$/g, '');

type RunGitOptions = {
    timeoutMs?: number;
};

export class GitWorkspaceService {
    private async deleteGitignoreDirectoryIfNeeded(clonePath: string): Promise<void> {
        const gitignorePath = path.join(clonePath, '.gitignore');

        console.log('[GitWorkspaceService] Checking .gitignore path:', gitignorePath);

        const gitignoreStats = await fs.stat(gitignorePath).catch(() => undefined);

        if (gitignoreStats?.isDirectory()) {
            console.log(
                '[GitWorkspaceService] .gitignore is a directory. Deleting it:',
                gitignorePath
            );

            await fs.rm(gitignorePath, { recursive: true, force: true });

            console.log('[GitWorkspaceService] .gitignore directory deleted successfully');
            return;
        }

        console.log('[GitWorkspaceService] .gitignore is not a directory or does not exist');
    }

    private runGit(
        arguments_: string[],
        cwd?: string,
        options?: RunGitOptions
    ): Promise<{ stdout: string; stderr: string }> {
        return new Promise((resolve, reject) => {
            const commandString = ['git', ...arguments_].join(' ');
            const timeoutMs = options?.timeoutMs;

            console.log('[GitWorkspaceService] Running git command:', commandString);
            console.log('[GitWorkspaceService] Working directory:', cwd ?? process.cwd());
            if (timeoutMs) {
                console.log('[GitWorkspaceService] Timeout configured (ms):', timeoutMs);
            }

            const child = spawn('git', arguments_, {
                cwd,
                env: {
                    ...process.env,
                    GIT_TERMINAL_PROMPT: '0',
                },
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            let stdout = '';
            let stderr = '';
            let timedOut = false;
            let killTimer: NodeJS.Timeout | undefined;
            let forceKillTimer: NodeJS.Timeout | undefined;

            if (timeoutMs && timeoutMs > 0) {
                killTimer = setTimeout(() => {
                    timedOut = true;

                    console.error(
                        `[GitWorkspaceService] Git command timed out after ${timeoutMs}ms:`,
                        commandString
                    );
                    console.error('[GitWorkspaceService] Sending SIGTERM to git process...');

                    child.kill('SIGTERM');

                    forceKillTimer = setTimeout(() => {
                        console.error(
                            '[GitWorkspaceService] Git process still alive. Sending SIGKILL...'
                        );
                        child.kill('SIGKILL');
                    }, 5_000);

                    forceKillTimer.unref();
                }, timeoutMs);

                killTimer.unref();
            }

            child.stdout.on('data', (chunk) => {
                const text = String(chunk);
                stdout += text;
                console.log(`[GitWorkspaceService][stdout] ${text.trimEnd()}`);
            });

            child.stderr.on('data', (chunk) => {
                const text = String(chunk);
                stderr += text;
                console.error(`[GitWorkspaceService][stderr] ${text.trimEnd()}`);
            });

            child.on('error', (error) => {
                if (killTimer) clearTimeout(killTimer);
                if (forceKillTimer) clearTimeout(forceKillTimer);

                console.error('[GitWorkspaceService] Failed to start git process:', error);

                reject(error);
            });

            child.on('close', (code, signal) => {
                if (killTimer) clearTimeout(killTimer);
                if (forceKillTimer) clearTimeout(forceKillTimer);

                console.log(
                    '[GitWorkspaceService] Git process finished:',
                    JSON.stringify({
                        command: commandString,
                        code,
                        signal,
                        timedOut,
                    })
                );

                if (code === 0 && !timedOut) {
                    resolve({ stdout, stderr });
                    return;
                }

                const error = new Error(
                    timedOut
                        ? `Git command timed out: ${commandString}`
                        : `Git command failed: ${commandString} (code=${code}, signal=${signal})`
                );

                console.error('[GitWorkspaceService] Git command failure details:', {
                    command: commandString,
                    code,
                    signal,
                    timedOut,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                });

                reject(error);
            });
        });
    }

    public buildClonePath(parameters: {
        cloneRootPath: string;
        owner: string;
        repo: string;
    }): string {
        const clonePath = path.join(
            parameters.cloneRootPath,
            sanitizeSegment(parameters.owner),
            sanitizeSegment(parameters.repo)
        );

        console.log('[GitWorkspaceService] Built clone path:', clonePath);

        return clonePath;
    }

    public async ensureRepository(parameters: {
        cloneRootPath: string;
        owner: string;
        repo: string;
        repositoryUrl: string;
    }): Promise<string> {
        console.log(
            '[GitWorkspaceService] ensureRepository called with:',
            JSON.stringify(parameters, null, 2)
        );

        const clonePath = this.buildClonePath(parameters);
        const ownerDirectory = path.join(
            parameters.cloneRootPath,
            sanitizeSegment(parameters.owner)
        );

        console.log('[GitWorkspaceService] Ensuring owner directory exists:', ownerDirectory);

        await fs.mkdir(ownerDirectory, { recursive: true });

        console.log(
            '[GitWorkspaceService] Checking if path is already a git work tree:',
            clonePath
        );

        const gitExists = await execFileAsync('git', [
            '-C',
            clonePath,
            'rev-parse',
            '--is-inside-work-tree',
        ])
            .then((result) => {
                console.log(
                    '[GitWorkspaceService] Existing git repository detected:',
                    result.stdout.trim()
                );
                return true;
            })
            .catch((error) => {
                console.log(
                    '[GitWorkspaceService] Repository does not exist yet or is invalid:',
                    error instanceof Error ? error.message : error
                );
                return false;
            });

        if (gitExists) {
            console.log('[GitWorkspaceService] Repository exists. Fetching latest refs...');

            await this.runGit(['fetch', '--all', '--prune', '--tags'], clonePath, {
                timeoutMs: 120_000,
            });
        } else {
            console.log(
                '[GitWorkspaceService] Repository does not exist. Cloning from:',
                parameters.repositoryUrl
            );

            await this.runGit(['clone', parameters.repositoryUrl, clonePath], undefined, {
                timeoutMs: 300_000,
            });
        }

        console.log('[GitWorkspaceService] Clone path ready:', clonePath);

        await this.deleteGitignoreDirectoryIfNeeded(clonePath);

        console.log('[GitWorkspaceService] ensureRepository completed successfully');

        return clonePath;
    }

    public async checkoutCommit(parameters: {
        clonePath: string;
        commitHash: string;
        clean?: boolean;
        cleanTimeoutMs?: number;
    }): Promise<void> {
        const clean = parameters.clean ?? false;
        const cleanTimeoutMs = parameters.cleanTimeoutMs ?? 120_000;

        try {
            console.log(
                '[GitWorkspaceService] checkoutCommit called with:',
                JSON.stringify(parameters, null, 2)
            );

            console.log('[GitWorkspaceService] Verifying commit exists before checkout...');
            await this.runGit(
                ['rev-parse', '--verify', `${parameters.commitHash}^{commit}`],
                parameters.clonePath,
                { timeoutMs: 30_000 }
            );

            console.log('[GitWorkspaceService] Running git reset --hard');
            await this.runGit(['reset', '--hard'], parameters.clonePath, {
                timeoutMs: 60_000,
            });

            console.log('[GitWorkspaceService] Running git checkout --force --detach');
            await this.runGit(
                [
                    '-c',
                    'advice.detachedHead=false',
                    'checkout',
                    '--force',
                    '--detach',
                    parameters.commitHash,
                ],
                parameters.clonePath,
                { timeoutMs: 120_000 }
            );

            if (!clean) {
                console.log(
                    '[GitWorkspaceService] Skipping git clean -ffdx. Tracked files are already moved to the requested commit.'
                );
                console.log(
                    '[GitWorkspaceService] Untracked / ignored files may remain in the working tree.'
                );
                console.log(
                    '[GitWorkspaceService] If you need a fully pristine working tree, call checkoutCommit({ ..., clean: true }).'
                );

                console.log('[GitWorkspaceService] checkoutCommit completed successfully');
                return;
            }

            console.log('[GitWorkspaceService] Strict clean requested. Running git clean -ffdx');

            try {
                await this.runGit(['clean', '-ffdx'], parameters.clonePath, {
                    timeoutMs: cleanTimeoutMs,
                });
            } catch (error) {
                console.error('[GitWorkspaceService] git clean -ffdx failed or timed out:', error);

                console.log('[GitWorkspaceService] Running diagnostic dry-run: git clean -ffdx -n');

                await this.runGit(['clean', '-ffdx', '-n'], parameters.clonePath, {
                    timeoutMs: 30_000,
                }).catch((diagnosticError) => {
                    console.error(
                        '[GitWorkspaceService] Diagnostic dry-run also failed:',
                        diagnosticError
                    );
                });

                throw error;
            }

            console.log('[GitWorkspaceService] checkoutCommit completed successfully');
        } catch (error) {
            console.error('[GitWorkspaceService] ERROR CHECKING OUT COMMIT', error);
            throw error;
        }
    }
}

export const gitWorkspaceService = new GitWorkspaceService();
