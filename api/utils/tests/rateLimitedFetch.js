import { expect } from 'chai'
import sinon from 'sinon'
import { rateLimitedFetch } from '../rateLimitedFetch.js'

describe('rateLimitedFetch', () => {

    let fetchStub

    beforeEach(() => {
        fetchStub = sinon.stub(global, 'fetch')
    })

    afterEach(() => {
        fetchStub.restore()
    })

    it('should call fetch once with the given URL and options', async function () {
        const mockResponse = {
            ok: true,
            json: async () => ({ data: 'test' }),
        }
        fetchStub.resolves(mockResponse)

        const testUrl = 'https://api.example.com/data'
        const testOptions = { method: 'GET' }

        const response = await rateLimitedFetch('weather', testUrl, testOptions)

        expect(fetchStub.calledOnce).to.be.true
        expect(fetchStub.calledWith(testUrl, testOptions)).to.be.true

        const jsonData = await response.json()
        expect(jsonData).to.deep.equal({ data: 'test' })
  })

    it('should handle fetch rejections properly', async function () {
        fetchStub.rejects(new Error('Network failure'))

        try {
        await rateLimitedFetch('weather', 'https://api.example.com/data')
        // If no error thrown, fail test:
        expect.fail('Expected error was not thrown')
        } catch (err) {
        expect(err).to.be.an('error')
        expect(err.message).to.equal('Network failure')
        }
  })

  it('should handle multiple fetch calls respecting the queue', async function () {
    fetchStub.callsFake(async (url) => {
      return {
        ok: true,
        json: async () => ({ url }),
      }
    })

    const urls = [
      'https://api.example.com/data1',
      'https://api.example.com/data2',
      'https://api.example.com/data3',
      'https://api.example.com/data4',
      'https://api.example.com/data5',
    ]

    const promises = urls.map(url => rateLimitedFetch('weather', url))

    const responses = await Promise.all(promises)

    expect(fetchStub.callCount).to.equal(5)

    urls.forEach((url, i) => {
      expect(fetchStub.getCall(i).args[0]).to.equal(url)
    })
    for (let i = 0; i < responses.length; i++) {
      const data = await responses[i].json()
      expect(data).to.deep.equal({ url: urls[i] })
    }
  })
})