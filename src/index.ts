import axios, { AxiosRequestConfig } from 'axios'
import { createHash } from 'crypto'

export namespace Token {
    export interface Request {
        username: string
        password: string
    }
    export interface Response {
        code: number
        message: string
        serverID: string
        datetime: Date
        token: string
    }
}


export interface Channel {
    channel: string
    name: string
    callsign: string
    affiliate?: string
}

export interface Status {
    account: {
        expires: Date
        messages: string[]
        maxLineups: number
    }
    lineups: {
        lineup: string
        modified: Date
        uri: string
    }[]
    lastDataUpdate: Date
    notifications: string[]
    systemStatus: {
        date: Date
        status: string
        message: string
    }[]
    serverID: string
    datetime: Date
    code: number
}

export class Service {
    private token?: string
    private myAxios = axios.create({
        baseURL: 'https://json.schedulesdirect.org/20141201'
    })
    private readonly credentials: Token.Request;
    constructor(username: string, password: string, passwordHashed = false) {
        const sha1Password = passwordHashed
            ? password
            : createHash('sha1').update(password).digest('hex')
        this.credentials = {
            username: username,
            password: sha1Password
        }
    }
    private async login() {
        const tokenResp = await this.myAxios.post<Token.Response>('token', this.credentials)
        setTimeout(() => {
            this.token = undefined
        }, 24 * 60 * 60 * 1000);
        this.token = tokenResp.data.token
    }
    private async getAxiosConfig(): Promise<AxiosRequestConfig> {
        if (!this.token) {
            await this.login()
        }
        return {
            headers: {
                token: this.token
            }
        }
    }
    async lineupPreview(lineupId: string) {
        const resp = await this.myAxios.get<Channel[]>('lineups/preview/' + lineupId, await this.getAxiosConfig())
        return resp.data
    }
    async status() {
        const resp = await this.myAxios.get<Status>('status', await this.getAxiosConfig())
        return resp.data
    }
}
