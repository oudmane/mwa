const puppeteer = require('puppeteer'),
  MongoDB = require('./libraries/MongoDB'),
  ElasticSearch = require('./libraries/ElasticSearch'),
  Category = require('./types/Category'),
  Candidate = require('./types/Candidate'),
  {
    CronJob
  } = require('cron')

// Wait for all drivers to connect
Promise.all([
  MongoDB.ready,
  ElasticSearch.ready
]).then(
  () =>
    puppeteer.launch({
      // headless: false,
      // userDataDir: './userDataDir/',
      args: [
        '--no-sandbox',
      ],
      timeout: 0
      // devtools: true
    }).then(
      async browser => {

        const categoriesTab = await browser.pages().then(pages => pages.shift()),
          categoryPage = await browser.newPage(),
          cronJob = new CronJob({
            cronTime: '* * * * *',
            runOnInit: true,
            async onTick() {

              await categoriesTab.goto(
                'https://vote.marocwebawards.com/',
                {
                  waitUntil: 'networkidle2'
                }
              )

              const categories = await categoriesTab.evaluate(
                () => $('.content article > a').map(
                  (i, a) => ({
                    id: $(a).attr('href').replace(/^\//, ''),
                    name: $(a).text().trim()
                  })
                ).get()
              ).catch(
                console.log
              )

              console.log('Found', categories.length, 'categories')

              await Promise.all(
                categories.map(
                  ({ id, name }) =>
                    Category.bindAndSave(
                      id,
                      { name }
                    )
                )
              )

              await categories.reduce(
                (promise, category) =>
                  promise.then(
                    async () => {

                      console.log('Going to', category.name)
                      await categoryPage.goto(
                        `https://vote.marocwebawards.com/${category.id}`,
                        {
                          waitUntil: 'networkidle2'
                        }
                      )

                      const candidates = await categoryPage.evaluate(
                        () =>
                          $('#candidats .candidat').map(
                            (i, c) => ({
                              id: $(c).find('a').attr('href').match(/\d+$/).shift(),
                              name: $(c).find('h2').text().trim(),
                              rtl: $(c).find('h2').attr('dir') == 'rtl',
                              votes: parseInt($(c).find('.counter span').text()),
                              image: $(c).find('img').attr('data-src')
                            })
                          ).get()
                      )

                      console.log('Found', candidates.length, 'candidates')

                      await Promise.all(
                        candidates.map(
                          ({ id, name, rtl, votes, image }) =>
                            Candidate.load(id).then(
                              candidate => {
                                // console.log(typeof candidate.id)
                                const oldVotes = candidate.votes
                                return candidate.bind({
                                  category: category.id,
                                  name, rtl, votes, image
                                }).then(
                                  bind =>
                                    bind.changed && candidate.save().then(
                                      () =>
                                        ElasticSearch.connection.index({
                                          index: 'changes',
                                          type: '_doc',
                                          body: {
                                            candidate: id,
                                            category: category.id,
                                            timestamp: Date.now(),
                                            change: candidate.votes - oldVotes,
                                            votes: candidate.votes
                                          }
                                        })
                                    )
                                )
                              }
                            )
                        )
                      )

                    }
                  ),
                Promise.resolve()
              )

              console.log('Daba dkhana')

            }
          })

        cronJob.start()

        // return browser.close()

      }
    )
)