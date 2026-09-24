/* eslint-disable @typescript-eslint/no-explicit-any, sonarjs/redundant-type-aliases, @typescript-eslint/consistent-indexed-object-style, unicorn/prevent-abbreviations, @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unused-vars */
declare let process: {
    env: Record<string, string | undefined>;
    on: (...args: any[]) => any;
    cwd: () => string;
};

declare namespace NodeJS {
    type Timeout = any;
}

interface ImportMeta {
    dirname: string;
}

declare namespace express {
    type Request = any;
    type Response = any;
    type NextFunction = any;
    type Application = any;
    type Router = any;
}

declare namespace expressSession {
    type SessionOptions = any;
}

declare module 'node:fs' {
    const fs: {
        readFileSync: (...args: any[]) => any;
        mkdir: (...args: any[]) => any;
    };
    export default fs;
}

declare module 'node:https' {
    const https: {
        createServer: (...args: any[]) => any;
    };
    export default https;
}

declare module 'node:path' {
    const path: {
        join: (...args: any[]) => string;
        dirname: (...args: any[]) => string;
    };
    export default path;
}

declare module 'node:util' {
    export const promisify: any;
    export const inspect: any;
}

declare module 'node:fs/promises' {
    const fsPromises: {
        mkdir: (...args: any[]) => Promise<any>;
        stat: (...args: any[]) => Promise<any>;
    };
    export default fsPromises;
}

declare module 'connect-pg-simple' {
    const connectPgSimple: any;
    export default connectPgSimple;
}

declare module 'cors' {
    const cors: any;
    export default cors;
}

declare module 'dotenv' {
    const dotenv: any;
    export default dotenv;
}

declare module 'express' {
    const expressDefault: any;
    namespace expressDefault {
        export type Request = any;
        export type Response = any;
        export type NextFunction = any;
        export type Application = any;
        export type Router = any;
    }
    export = expressDefault;
}

declare module 'express-session' {
    export interface SessionData {
        [key: string]: any;
    }
    const session: any;
    namespace session {
        export type SessionOptions = any;
    }
    export = session;
}

declare module 'pg' {
    export class Pool {
        constructor(...args: any[]);
    }
    const pg: any;
    export default pg;
}

declare module 'uuid' {
    export const v4: any;
}

declare module 'exceljs' {
    const ExcelJS: any;
    export default ExcelJS;
}

declare module 'sequelize' {
    export const DataTypes: any;
    export const Op: any;
    export type QueryInterface = {
        createTable: (...args: any[]) => Promise<any>;
        dropTable: (...args: any[]) => Promise<any>;
        bulkInsert: (...args: any[]) => Promise<any>;
        bulkDelete: (...args: any[]) => Promise<any>;
        [key: string]: any;
    };
    export const Transaction: any;
    export class Sequelize {
        public static readonly Transaction: any;
        constructor(...args: any[]);
        authenticate(...args: any[]): Promise<any>;
        transaction(...args: any[]): Promise<any>;
        [key: string]: any;
    }
    export class Model<TModelAttributes = any, TCreationAttributes = any> {
        [key: string]: any;
        public static readonly init: any;
        public static readonly create: any;
        public static readonly bulkCreate: any;
        public static readonly findAll: any;
        public static readonly findOne: any;
        public static readonly update: any;
        public static readonly count: any;
        save: any;
    }
}

declare module 'axios' {
    export type AxiosResponse<T = any> = { data: T; status: number; headers: any };
    export type InternalAxiosRequestConfig = any;
    export interface AxiosInstance {
        get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
        post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
        put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
        patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
        delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
        request<T = any>(config: any): Promise<AxiosResponse<T>>;
        interceptors: any;
    }
    const axios: { create(config?: any): AxiosInstance };
    export default axios;
}

declare module 'bcrypt' {
    const bcrypt: {
        genSaltSync: (...args: any[]) => string;
        hashSync: (...args: any[]) => string;
        compareSync: (...args: any[]) => boolean;
        hash: (...args: any[]) => Promise<string>;
        compare: (...args: any[]) => Promise<boolean>;
    };
    export default bcrypt;
}

declare module 'node:child_process' {
    export const execFile: any;
}

declare module 'child_process' {
    export const execFile: any;
}
