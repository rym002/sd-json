import 'mocha'
import { Service } from '../src/index'
import { expect, use } from 'chai';
import * as nock from 'nock'
import { createSandbox } from 'sinon'
describe('SD JSON', function () {
    const sdNock = nock('https://json.schedulesdirect.org/20141201')
    const sandbox = createSandbox({
        useFakeTimers: true
    })
    beforeEach(function () {
        sdNock
            .post('/token', {
                username: 'testuser',
                password: '206c80413b9a96c1312cc346b7d2517b84463edd'
            })
            .reply(200, {
                token: 'testToken'
            })
    })
    after(function () {
        sandbox.restore()
    })
    it('shoulld return status', async function () {
        sdNock
            .get('/status')
            .reply(200, {
                lineups: [
                    {
                        lineup: '1'
                    },
                    {
                        lineup: '2'
                    }
                ]
            })
        const service = new Service('testuser', 'testpass')
        const status = await service.status()
        expect(status)
            .to.have.property('lineups')
            .to.have.length(2)
    })
    it('should return preview lineup', async function () {
        sdNock
            .get('/lineups/preview/USA-123-X')
            .reply(200, [
                {
                    channel: '1'
                },
                {
                    channel: '2'
                }
            ])
        const service = new Service('testuser', 'testpass')
        const lineupPreview = await service.lineupPreview('USA-123-X')
        expect(lineupPreview)
            .to.have.length(2)

    })
})