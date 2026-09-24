import { execFile, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface SonarqubeScanResult {
    taskId?: string;
    dashboardUrl?: string;
    rawOutput: string;
    resolvedJavaBinaries?: string;
    javaSourcesDetected: boolean;
    javaExcludedFromAnalysis: boolean;
}

interface ExecFileFailure extends Error {
    code?: number | string | null;
    signal?: string | null;
    stdout?: string;
    stderr?: string;
}

interface FileSearchOptions {
    pruneBuildDirectories?: boolean;
}

export class SonarqubeScannerService {
    public async scan(parameters: {
        projectKey: string;
        projectName: string;
        sourcePath: string;
        changedFiles?: string[];
    }): Promise<SonarqubeScanResult> {
        console.log('[scan] Starting SonarQube scan with parameters:', parameters);

        const sonarHostUrl = (process.env.SONARQUBE_URL || '').trim();
        const sonarToken = (process.env.SONARQUBE_TOKEN || process.env.SONAR_TOKEN || '').trim();

        if (!sonarHostUrl || !sonarToken) {
            throw new Error(
                'SONARQUBE_URL and SONARQUBE_TOKEN (or SONAR_TOKEN) are required for scanning.'
            );
        }

        const rawConfiguredSources = (process.env.SONARQUBE_SOURCES || '').trim();
        const resolvedConfiguredSources = await this.resolveConfiguredSources(
            parameters.sourcePath,
            rawConfiguredSources
        );

        const allowRootFallback =
            (process.env.SONARQUBE_ALLOW_ROOT_SOURCE_FALLBACK || 'false').trim().toLowerCase() ===
            'true';

        const changedFileInclusions = await this.resolveChangedFileInclusions(
            parameters.sourcePath,
            parameters.changedFiles || []
        );

        const configuredSources =
            resolvedConfiguredSources ||
            (changedFileInclusions.length > 0 ? '.' : allowRootFallback ? '.' : '');

        const configuredTests = (process.env.SONARQUBE_TESTS || '').trim();
        const configuredExclusions = (process.env.SONARQUBE_EXCLUSIONS || '').trim();
        const configuredInclusions = (process.env.SONARQUBE_INCLUSIONS || '').trim();
        const configuredLogLevel = (process.env.SONARQUBE_LOG_LEVEL || '').trim().toUpperCase();

        const sonarVerbose =
            (process.env.SONARQUBE_VERBOSE || 'false').trim().toLowerCase() === 'true';
        const scmDisabled =
            (process.env.SONARQUBE_SCM_DISABLED || 'false').trim().toLowerCase() === 'true';
        const scmExclusionsDisabled =
            (process.env.SONARQUBE_SCM_EXCLUSIONS_DISABLED || 'false').trim().toLowerCase() ===
            'true';
        const skipSystemTruststore =
            (process.env.SONARQUBE_SKIP_SYSTEM_TRUSTSTORE || 'false').trim().toLowerCase() ===
            'true';

        console.log('[scan] Raw configured sonar.sources:', rawConfiguredSources || '<empty>');
        console.log(
            '[scan] Resolved configured sonar.sources:',
            resolvedConfiguredSources || '<none>'
        );
        console.log('[scan] Changed file inclusions count:', changedFileInclusions.length);
        console.log('[scan] Final sonar.sources:', configuredSources || '<none>');
        console.log('[scan] Allow root fallback:', allowRootFallback);
        console.log('[scan] Configured sonar.tests:', configuredTests || '<none>');
        console.log('[scan] Configured sonar.exclusions:', configuredExclusions || '<none>');
        console.log('[scan] Configured sonar.inclusions:', configuredInclusions || '<none>');
        console.log('[scan] Configured sonar.log.level:', configuredLogLevel || '<default>');
        console.log('[scan] Configured verbose mode:', sonarVerbose);
        console.log('[scan] Configured sonar.scm.disabled:', scmDisabled);
        console.log('[scan] Configured sonar.scm.exclusions.disabled:', scmExclusionsDisabled);
        console.log('[scan] Configured sonar.scanner.skipSystemTruststore:', skipSystemTruststore);

        if (!configuredSources) {
            throw new Error(
                [
                    'No valid SonarQube sources could be resolved.',
                    'Configured SONARQUBE_SOURCES paths do not exist in the checked-out commit,',
                    'and no existing changed files were provided to narrow analysis safely.',
                    'Refusing to fall back to sonar.sources=. because that may scan the entire repository.',
                ].join(' ')
            );
        }

        if (configuredSources === '.') {
            console.log(
                '[scan] Warning: sonar.sources resolved to ".". Analysis will be narrowed using sonar.inclusions when available.'
            );
        }

        const exclusions = new Set(this.parseCsvList(configuredExclusions));
        const inclusions = new Set([
            ...this.parseCsvList(configuredInclusions),
            ...changedFileInclusions,
        ]);

        const arguments_ = [
            `-Dsonar.host.url=${sonarHostUrl}`,
            `-Dsonar.projectKey=${parameters.projectKey}`,
            `-Dsonar.projectName=${parameters.projectName}`,
            `-Dsonar.sources=${configuredSources}`,
            '-Dsonar.qualitygate.wait=false',
        ];

        if (configuredTests) {
            console.log('[scan] Adding sonar.tests');
            arguments_.push(`-Dsonar.tests=${configuredTests}`);
        }

        if (configuredLogLevel) {
            console.log('[scan] Adding sonar.log.level');
            arguments_.push(`-Dsonar.log.level=${configuredLogLevel}`);
        }

        if (sonarVerbose) {
            console.log('[scan] Enabling verbose scanner mode');
            arguments_.push('-Dsonar.verbose=true');
            arguments_.push('-X');
        }

        if (scmDisabled) {
            console.log('[scan] Disabling SCM integration');
            arguments_.push('-Dsonar.scm.disabled=true');
        }

        if (scmExclusionsDisabled) {
            console.log('[scan] Disabling SCM ignore-based exclusions');
            arguments_.push('-Dsonar.scm.exclusions.disabled=true');
        }

        if (skipSystemTruststore) {
            console.log('[scan] Skipping system truststore loading');
            arguments_.push('-Dsonar.scanner.skipSystemTruststore=true');
        }

        console.log('[scan] Checking for Java source files...');
        const hasJavaSourceFiles = await this.hasFileWithExtension(parameters.sourcePath, '.java', {
            pruneBuildDirectories: true,
        });
        console.log('[scan] Java source files detected:', hasJavaSourceFiles);

        const configuredJavaBinaries = process.env.SONARQUBE_JAVA_BINARIES?.trim() || '';

        console.log('[scan] Resolving Java binaries...');
        const resolvedJavaBinaries = hasJavaSourceFiles
            ? configuredJavaBinaries || (await this.resolveJavaBinaries(parameters.sourcePath))
            : '';
        console.log('[scan] Java binaries resolved:', resolvedJavaBinaries);

        let javaExcludedFromAnalysis = false;

        if (hasJavaSourceFiles) {
            if (resolvedJavaBinaries) {
                console.log('[scan] Adding Java binaries to scanner arguments');
                arguments_.push(`-Dsonar.java.binaries=${resolvedJavaBinaries}`);
            } else {
                const strictJavaAnalysis =
                    (process.env.SONARQUBE_STRICT_JAVA_ANALYSIS || 'false').trim().toLowerCase() ===
                    'true';

                if (strictJavaAnalysis) {
                    throw new Error(
                        [
                            'Java source files were found, but no compiled Java binaries were found.',
                            'Set SONARQUBE_JAVA_BINARIES or build the project first so compiled .class files exist.',
                        ].join(' ')
                    );
                }

                console.log('[scan] Excluding Java files from analysis due to missing binaries');
                exclusions.add('**/*.java');
                javaExcludedFromAnalysis = true;
            }
        }

        if (exclusions.size > 0) {
            const joinedExclusions = [...exclusions].join(',');
            console.log('[scan] Final sonar.exclusions:', joinedExclusions);
            arguments_.push(`-Dsonar.exclusions=${joinedExclusions}`);
        }

        if (inclusions.size > 0) {
            const joinedInclusions = [...inclusions].join(',');
            console.log('[scan] Final sonar.inclusions:', joinedInclusions);
            arguments_.push(`-Dsonar.inclusions=${joinedInclusions}`);
        }

        const command =
            process.env.SONARQUBE_SCANNER_BIN ||
            (process.platform === 'win32' ? 'sonar-scanner.bat' : 'sonar-scanner');

        let output = '';

        try {
            console.log('[scan] Executing sonar-scanner command:', command);
            console.log('[scan] sonar-scanner arguments:', this.redactScannerArguments(arguments_));
            console.log('[scan] sonar-scanner cwd:', parameters.sourcePath);

            const scannerEnv = this.buildScannerEnvironment(sonarToken);

            const { stdout, stderr } = await this.runScannerCommand(
                command,
                arguments_,
                parameters.sourcePath,
                scannerEnv,
                sonarToken
            );

            output = `${stdout || ''}\n${stderr || ''}`.trim();
            console.log('[scan] sonar-scanner executed successfully');
        } catch (error) {
            console.log('[scan] sonar-scanner execution failed');
            const execError = error as ExecFileFailure;
            const stdout = execError.stdout || '';
            const stderr = execError.stderr || '';

            output = `${stdout}\n${stderr}`.trim();

            const exitCode =
                typeof execError.code === 'number' || typeof execError.code === 'string'
                    ? ` (exit code: ${String(execError.code)})`
                    : '';

            const signal = execError.signal ? ` (signal: ${execError.signal})` : '';
            const details = output ? `\nScanner output:\n${output}` : '';

            throw new Error(
                [
                    `sonar-scanner failed${exitCode}${signal}.`,
                    `Command: ${command} ${this.redactScannerArguments(arguments_).join(' ')}`,
                    details,
                ].join(' ')
            );
        }

        console.log('[scan] Extracting task ID and dashboard URL from output');
        const result = {
            taskId: this.extractValue(output, /ce\/task\?id=([\w-]+)/),
            dashboardUrl: this.extractValue(output, /(https?:\/\/[^\s]*\/dashboard\?id=[^\s]+)/),
            rawOutput: output,
            resolvedJavaBinaries: resolvedJavaBinaries || undefined,
            javaSourcesDetected: hasJavaSourceFiles,
            javaExcludedFromAnalysis,
        };
        console.log('[scan] SonarQube scan completed successfully');
        return result;
    }

    private buildScannerEnvironment(sonarToken: string): NodeJS.ProcessEnv {
        console.log('[buildScannerEnvironment] Building scanner environment');
        return {
            ...process.env,
            SONAR_TOKEN: sonarToken,
        };
    }

    private redactScannerArguments(arguments_: string[]): string[] {
        console.log('[redactScannerArguments] Redacting scanner arguments for logging');
        return arguments_.map((argument) => {
            if (argument.startsWith('-Dsonar.token=')) {
                return '-Dsonar.token=***REDACTED***';
            }

            if (argument.startsWith('-Dsonar.login=')) {
                return '-Dsonar.login=***REDACTED***';
            }

            return argument;
        });
    }

    private parseCsvList(value: string): string[] {
        console.log('[parseCsvList] Parsing CSV value:', value || '<empty>');
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    private sanitizeForLogs(text: string, sonarToken: string): string {
        let sanitized = text;

        if (sonarToken) {
            sanitized = sanitized.split(sonarToken).join('***REDACTED***');
        }

        sanitized = sanitized.replace(
            /(['"]sonar\.token['"]\s*:\s*['"])[^'"]+(['"])/g,
            '$1***REDACTED***$2'
        );
        sanitized = sanitized.replace(
            /("key"\s*:\s*"sonar\.token"\s*,\s*"value"\s*:\s*")[^"]+(")/g,
            '$1***REDACTED***$2'
        );
        sanitized = sanitized.replace(/(-Dsonar\.token=)[^\s]+/g, '$1***REDACTED***');
        sanitized = sanitized.replace(/(SONAR_TOKEN=)[^\s]+/g, '$1***REDACTED***');

        return sanitized;
    }

    private normalizeRelativePath(filePath: string): string {
        console.log('[normalizeRelativePath] Normalizing path:', filePath);
        return filePath
            .replace(/\\/g, '/')
            .replace(/^\.?\//, '')
            .trim();
    }

    private async resolveConfiguredSources(
        sourcePath: string,
        configuredSources: string
    ): Promise<string> {
        console.log(
            '[resolveConfiguredSources] Resolving configured sources:',
            configuredSources || '<empty>'
        );

        if (!configuredSources.trim()) {
            console.log('[resolveConfiguredSources] No configured sources provided');
            return '';
        }

        const requestedPaths = configuredSources
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        const existingPaths: string[] = [];

        for (const relativePath of requestedPaths) {
            const normalizedPath = this.normalizeRelativePath(relativePath);
            const absolutePath = path.join(sourcePath, normalizedPath);

            console.log(
                '[resolveConfiguredSources] Checking configured source path:',
                normalizedPath,
                '->',
                absolutePath
            );

            try {
                await fs.access(absolutePath);
                existingPaths.push(normalizedPath);
                console.log(
                    '[resolveConfiguredSources] Source path exists and will be used:',
                    normalizedPath
                );
            } catch {
                console.log(
                    '[resolveConfiguredSources] Source path does not exist and will be skipped:',
                    normalizedPath
                );
            }
        }

        if (existingPaths.length === 0) {
            console.log('[resolveConfiguredSources] No configured source paths exist');
            return '';
        }

        const result = existingPaths.join(',');
        console.log('[resolveConfiguredSources] Final resolved sources:', result);
        return result;
    }

    private async resolveChangedFileInclusions(
        sourcePath: string,
        changedFiles: string[]
    ): Promise<string[]> {
        console.log('[resolveChangedFileInclusions] Resolving changed file inclusions');

        const normalizedFiles = [
            ...new Set(
                changedFiles.map((filePath) => this.normalizeRelativePath(filePath)).filter(Boolean)
            ),
        ];

        const existingFiles: string[] = [];

        for (const relativePath of normalizedFiles) {
            const absolutePath = path.join(sourcePath, relativePath);

            console.log(
                '[resolveChangedFileInclusions] Checking changed file path:',
                relativePath,
                '->',
                absolutePath
            );

            try {
                const stats = await fs.stat(absolutePath);

                if (stats.isFile()) {
                    existingFiles.push(relativePath);
                    console.log(
                        '[resolveChangedFileInclusions] Changed file exists and will be included:',
                        relativePath
                    );
                } else {
                    console.log(
                        '[resolveChangedFileInclusions] Changed path exists but is not a file, skipping:',
                        relativePath
                    );
                }
            } catch {
                console.log(
                    '[resolveChangedFileInclusions] Changed file does not exist in current checkout, skipping:',
                    relativePath
                );
            }
        }

        console.log(
            '[resolveChangedFileInclusions] Final changed-file inclusions count:',
            existingFiles.length
        );
        return existingFiles;
    }

    private async runScannerCommand(
        command: string,
        arguments_: string[],
        cwd: string,
        env: NodeJS.ProcessEnv,
        sonarToken: string
    ): Promise<{ stdout: string; stderr: string }> {
        console.log('[runScannerCommand] Starting sonar-scanner process');
        console.log('[runScannerCommand] Command:', command);
        console.log('[runScannerCommand] Arguments:', this.redactScannerArguments(arguments_));
        console.log('[runScannerCommand] CWD:', cwd);

        return await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
            const child = spawn(command, arguments_, {
                cwd,
                env,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: process.platform === 'win32',
            });

            let stdout = '';
            let stderr = '';

            const timeoutMs = Number(process.env.SONARQUBE_SCANNER_TIMEOUT_MS || 15 * 60_000);

            console.log('[runScannerCommand] Timeout configured (ms):', timeoutMs);

            const timeout = setTimeout(() => {
                console.log('[runScannerCommand] sonar-scanner timed out, sending SIGTERM');

                child.kill('SIGTERM');

                setTimeout(() => {
                    if (!child.killed) {
                        console.log(
                            '[runScannerCommand] sonar-scanner did not terminate after SIGTERM, sending SIGKILL'
                        );
                        child.kill('SIGKILL');
                    }
                }, 5_000).unref();
            }, timeoutMs);

            child.stdout?.on('data', (chunk: Buffer | string) => {
                const text = chunk.toString();
                const sanitizedText = this.sanitizeForLogs(text, sonarToken);
                stdout += sanitizedText;
                process.stdout.write(sanitizedText);
            });

            child.stderr?.on('data', (chunk: Buffer | string) => {
                const text = chunk.toString();
                const sanitizedText = this.sanitizeForLogs(text, sonarToken);
                stderr += sanitizedText;
                process.stderr.write(sanitizedText);
            });

            child.on('spawn', () => {
                console.log('[runScannerCommand] sonar-scanner process spawned successfully');
            });

            child.on('error', (error) => {
                clearTimeout(timeout);
                console.log('[runScannerCommand] Failed to start sonar-scanner:', error);

                const execError = error as ExecFileFailure;
                execError.stdout = stdout;
                execError.stderr = stderr;

                reject(execError);
            });

            child.on('close', (code, signal) => {
                clearTimeout(timeout);

                console.log(
                    '[runScannerCommand] sonar-scanner process closed. code:',
                    code,
                    'signal:',
                    signal
                );

                if (code === 0) {
                    console.log('[runScannerCommand] sonar-scanner finished successfully');
                    resolve({ stdout, stderr });
                    return;
                }

                const execError = new Error(
                    `sonar-scanner exited with code ${String(code)} and signal ${String(signal)}`
                ) as ExecFileFailure;

                execError.code = code;
                execError.signal = signal;
                execError.stdout = stdout;
                execError.stderr = stderr;

                reject(execError);
            });
        });
    }

    private extractValue(text: string, regex: RegExp): string | undefined {
        console.log('[extractValue] Starting extraction with regex:', regex);
        const match = text.match(regex);
        const value = match?.[1] || match?.[0];
        console.log('[extractValue] Extraction completed, value:', value);
        return value;
    }

    private async resolveJavaBinaries(sourcePath: string): Promise<string> {
        console.log(
            '[resolveJavaBinaries] Starting Java binaries resolution for path:',
            sourcePath
        );
        const discoveredDirectories = new Set<string>();

        const directCandidates = ['target/classes', 'build/classes/java/main', 'out/production'];

        for (const relativeDirectory of directCandidates) {
            console.log('[resolveJavaBinaries] Checking direct candidate:', relativeDirectory);
            const absoluteDirectory = path.join(sourcePath, relativeDirectory);

            if (await this.directoryContainsClassFiles(absoluteDirectory)) {
                console.log('[resolveJavaBinaries] Found class files in:', relativeDirectory);
                discoveredDirectories.add(relativeDirectory);
            }
        }

        console.log('[resolveJavaBinaries] Searching for nested candidates...');
        const nestedCandidates = await this.findRelativeDirectories(sourcePath, [
            '*/target/classes',
            '*/build/classes/java/main',
            '*/out/production',
            '*/out/production/*',
        ]);

        for (const relativeDirectory of nestedCandidates) {
            console.log('[resolveJavaBinaries] Checking nested candidate:', relativeDirectory);
            const normalizedDirectory = relativeDirectory.replace(/^\.?\//, '');
            const absoluteDirectory = path.join(sourcePath, normalizedDirectory);

            if (await this.directoryContainsClassFiles(absoluteDirectory)) {
                console.log(
                    '[resolveJavaBinaries] Found class files in nested:',
                    normalizedDirectory
                );
                discoveredDirectories.add(normalizedDirectory);
            }
        }

        const result = [...discoveredDirectories].sort().join(',');
        console.log('[resolveJavaBinaries] Resolution completed, result:', result);
        return result;
    }

    private async directoryContainsClassFiles(directoryPath: string): Promise<boolean> {
        console.log('[directoryContainsClassFiles] Checking directory:', directoryPath);
        try {
            const stats = await fs.stat(directoryPath);

            if (!stats.isDirectory()) {
                console.log(
                    '[directoryContainsClassFiles] Path is not a directory:',
                    directoryPath
                );
                return false;
            }

            const result = await this.hasFileWithExtension(directoryPath, '.class', {
                pruneBuildDirectories: false,
            });
            console.log(
                '[directoryContainsClassFiles] Check completed for:',
                directoryPath,
                'result:',
                result
            );
            return result;
        } catch (error) {
            console.log(
                '[directoryContainsClassFiles] Error checking directory:',
                directoryPath,
                error
            );
            return false;
        }
    }

    private async findRelativeDirectories(rootPath: string, patterns: string[]): Promise<string[]> {
        console.log(
            '[findRelativeDirectories] Starting search in:',
            rootPath,
            'with patterns:',
            patterns
        );
        if (patterns.length === 0) {
            console.log('[findRelativeDirectories] No patterns provided, returning empty');
            return [];
        }

        const { stdout } = await execFileAsync(
            'find',
            [
                '.',
                '(',
                ...this.buildPruneExpression({
                    pruneBuildDirectories: false,
                }),
                ')',
                '-prune',
                '-o',
                '-type',
                'd',
                '(',
                ...this.buildAlternatingExpression('-path', patterns),
                ')',
                '-print',
            ],
            {
                cwd: rootPath,
                maxBuffer: 10 * 1024 * 1024,
            }
        );

        const results = stdout
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => line.replace(/^\.?\//, ''));

        console.log(
            '[findRelativeDirectories] Search completed, found:',
            results.length,
            'directories'
        );
        return results;
    }

    private async hasFileWithExtension(
        rootPath: string,
        extension: string,
        options: FileSearchOptions = {}
    ): Promise<boolean> {
        console.log(
            '[hasFileWithExtension] Starting search in:',
            rootPath,
            'for extension:',
            extension
        );
        const extensionWithoutDot = extension.replace(/^\.+/, '');

        const { stdout } = await execFileAsync(
            'find',
            [
                '.',
                '(',
                ...this.buildPruneExpression(options),
                ')',
                '-prune',
                '-o',
                '-type',
                'f',
                '-name',
                `*.${extensionWithoutDot}`,
                '-print',
                '-quit',
            ],
            {
                cwd: rootPath,
                maxBuffer: 1024 * 1024,
            }
        );

        const result = stdout.trim().length > 0;
        console.log(
            '[hasFileWithExtension] Search completed for extension:',
            extension,
            'result:',
            result
        );
        return result;
    }

    private buildPruneExpression(options: FileSearchOptions = {}): string[] {
        console.log('[buildPruneExpression] Building prune expression with options:', options);
        const directoryNames = [
            '.git',
            '.scannerwork',
            'node_modules',
            '.idea',
            '.vscode',
            'dist',
            'coverage',
        ];

        if (options.pruneBuildDirectories !== false) {
            directoryNames.push('build', 'target', 'out');
        }

        const result = this.buildAlternatingExpression('-name', directoryNames);
        console.log('[buildPruneExpression] Prune expression built');
        return result;
    }

    private buildAlternatingExpression(operator: '-name' | '-path', values: string[]): string[] {
        console.log(
            '[buildAlternatingExpression] Building expression with operator:',
            operator,
            'values count:',
            values.length
        );
        const expression: string[] = [];

        for (const [index, value] of values.entries()) {
            if (index > 0) {
                expression.push('-o');
            }

            expression.push(operator, value);
        }

        console.log('[buildAlternatingExpression] Expression built');
        return expression;
    }
}

export const sonarqubeScannerService = new SonarqubeScannerService();
