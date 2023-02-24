const { expect } = require('chai')
const path = require('path')
const puppeteer = require('puppeteer')
const { Suite } = require('supposed')
const blueprint = require('@polyn/blueprint')

const __projectdir = process.cwd()
const suiteConfig = {
  name: '@polyn/blueprint (browser)',
  assertionLibrary: expect,
  sut: blueprint,
}
const suite = Suite(suiteConfig)
const runner = suite.runner({
  title: suiteConfig.name,
  directories: ['./src'],
  dependencies: ['/node_modules/chai/chai.js', '/dist/blueprint.min.js'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules|documentation.test.js/i,
  stringifiedSuiteConfig: '{ reporter: "event", assertionLibrary: chai.expect, inject: { expect: chai.expect, sut: polyn.blueprint } }',
})

const debug = false
const puppeteerConfig = debug
  ? {
      headless: false,
      slowMo: 250, // slow down by 250ms
      devtools: true,
    }
  : undefined

const runTestsInBrowser = async (context) => {
  const browser = await puppeteer.launch(puppeteerConfig)
  const page = await browser.newPage()

  page.on('console', async (msg) => {
    const txt = msg.text()

    try {
      const json = JSON.parse(txt)
      context.lastEvent = json
      suite.config.reporters.forEach((reporter) => reporter.write({
        ...json,
        ...{ suiteId: suiteConfig.name },
      }))

      if (json.type === 'END' && json.totals.failed > 0) {
        // maybe print a PDF that someone can review if this is being automated
        await page.pdf({ path: path.join(__projectdir, `test-log.${Date.now()}.pdf`), format: 'A4' })
      }
    } catch (err) {
      context.lastEvent = { msg: txt, err }
    }
  })

  await page.goto(`http://localhost:${context.runConfig.port}`, { waitUntil: 'networkidle2' })
  if (debug) {
    await page.evaluate(() => {
      debugger // eslint-disable-line no-debugger
    })
  }
  await browser.close()

  return context
}

module.exports = async () => {
  const context = await runner.startServer()
  const finalContext = await runTestsInBrowser(context)

  return finalContext
}
