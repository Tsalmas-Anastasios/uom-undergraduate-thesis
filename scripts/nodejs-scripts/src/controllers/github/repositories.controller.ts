import fs from 'node:fs/promises';
import path from 'node:path';

import ExcelJS from 'exceljs';
import express from 'express';

import { GitHub } from '../../models/index.model.ts';
import { githubApiService } from '../../services/index.service.ts';
import { errorUtilities } from '../../utils/index.utilities.ts';
import { BaseController } from '../base.controller.ts';

export class GitHubRepositoriesController extends BaseController {
    public async getRepositories(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response | undefined> {
        const exportToExcel: boolean = request.query?.exportToExcel
            ? Boolean(request.query.exportToExcel)
            : false;
        const onlyRepositoryNames: boolean = request.query?.onlyRepositoryNames
            ? Boolean(request.query.onlyRepositoryNames)
            : false;
        const user: string = request.query?.user?.toString() || '';

        let repositories: GitHub.Model.Repository[];
        try {
            repositories = await githubApiService.repositories.fetch.getRepositories({
                username: user,
            });
        } catch (error) {
            const message = errorUtilities.getErrorMessage(error);
            return response.status(500).json({ message });
        }

        if (exportToExcel) await this.generateExcelFile(repositories);

        if (onlyRepositoryNames) {
            const repositoryNames: string[] = repositories.map(
                (repository: GitHub.Model.Repository) => repository.name
            );
            return response.status(200).json({ repositories: repositoryNames });
        }

        return response.status(200).json({ repositories });
    }

    private async generateExcelFile(excelData: GitHub.Model.Repository[]): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Repositories');

        const excelColumns = [
            { header: 'Repository Name', key: 'repositoryName', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'URL', key: 'url', width: 50 },
            { header: 'Stars', key: 'stars', width: 10 },
            { header: 'Forks', key: 'forks', width: 10 },
            { header: 'Open Issues', key: 'openIssues', width: 15 },
        ];
        worksheet.columns = excelColumns;

        worksheet.addRows(excelData);

        const exportDirectory = path.join(process.cwd(), 'exports', 'reports', 'repositories');
        await fs.mkdir(exportDirectory, { recursive: true });
        const fileName = `repositories_${Date.now()}.xlsx`;
        const filePath = path.join(exportDirectory, fileName);
        await workbook.xlsx.writeFile(filePath);
    }
}
