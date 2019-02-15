const puppeteer = require('puppeteer'),
  MongoDB = require('./libraries/MongoDB'),
  ElasticSearch = require('./libraries/ElasticSearch'),
  Category = require('./types/Category'),
  Candidate = require('./types/Candidate'),
  {
    CronJob
  } = require('cron'),
  pubsub = require('./libraries/pubsub')

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
            cronTime: '0 * * * *',
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

              const allChanges = []

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
                                    bind.changed //&& candidate.save()
                                ).then(
                                  () => ({
                                    candidate: id,
                                    category: category.id,
                                    timestamp: Date.now(),
                                    change: candidate.votes - oldVotes,
                                    votes: candidate.votes
                                  })
                                ).then(
                                  body => {
                                    pubsub.publish(
                                      body.candidate,
                                      {
                                        change: body.change,
                                        votes: body.votes
                                      }
                                    )
                                    // ElasticSearch.connection.index({
                                    //   index: 'changes',
                                    //   type: '_doc',
                                    //   body: {
                                    //     candidate: id,
                                    //     category: category.id,
                                    //     timestamp: Date.now(),
                                    //     change: candidate.votes - oldVotes,
                                    //     votes: candidate.votes
                                    //   }
                                    // })
                                    return body
                                  }
                                )
                              }
                            )
                        )
                      ).then(
                        // sum changes
                        changes =>
                          changes.reduce(
                            (total, change) => ({
                              change: total.change + change.change,
                              votes: total.votes + change.votes
                            }),
                            {
                              change: 0,
                              votes: 0,
                            }
                          )
                      ).then(
                        change => {
                          allChanges.push(change)
                          pubsub.publish(
                            category.id,
                            change
                          )
                        }
                      )

                    }
                  ),
                Promise.resolve()
              )

              pubsub.publish(
                'all',
                allChanges.reduce(
                  (total, change) => ({
                    change: total.change + change.change,
                    votes: total.votes + change.votes
                  }),
                  {
                    change: 0,
                    votes: 0,
                  }
                )
              )

              // dkhanna means we're done for this minute :D
              console.log('Daba dkhana')

            }
          })

        cronJob.start()

        // return browser.close()

      }
    )
)