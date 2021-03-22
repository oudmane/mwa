import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Candidature } from './candidature.entity';
import { Category } from './category.entity';
import { Cron, Timeout } from '@nestjs/schedule';
import got from 'got';
import * as cheerio from 'cheerio';
import { Job, Queue } from 'bull';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Agent } from 'http2-wrapper';
import * as HttpAgent from 'agentkeepalive';
import { CookieJar } from 'tough-cookie';

@Injectable()
@Processor('crawl')
export class AppService {
  request = got.extend({
    prefixUrl: 'https://vote.marocwebawards.com',
    http2: true,
    // @ts-ignore
    // lookup(hostname, options, callback) {
    //   callback(null, '51.15.231.73', 4)
    // },
    agent: {
      http2: new Agent({
        // timeout: 1000,
      }),
      // http: new HttpAgent(),
      // https: new HttpAgent.HttpsAgent(),
    },
    // cookieJar: new CookieJar(),
    headers: {
      'user-agent': 'Ayoub Oudmane (Monitoring; +https://oudmane.me)',
    },
    searchParams: {
      get _() {
        return Date.now()
      }
    },
    // hooks: {
    //   beforeRequest: [
    //     (options) => {
    //       // options.url.pathname
    //       // console.log(options.url.pathname);
    //       // return response;
    //     },
    //   ],
    // },
  });
  constructor(
    @Inject(Connection)
    private connection: Connection,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Candidature)
    private candidatureRepository: Repository<Candidature>,
    @InjectQueue('crawl')
    private queue: Queue,
  ) {}

  html(url) {
    return this.request(url)
      .text()
      .then(html => cheerio.load(html));
  }

  @Timeout(0)
  start() {
    // this.fetchCategories();
  }

  @Cron('*/10 * * * * *')
  async fetchCategories() {
    console.log('fetchCategories');
    const categories = await this.html('').then(($) => {
      const list = $('.cats a')
        .map((i, cat) => ({
          id: parseInt($(cat).attr('href').match(/\d+$/)[0]),
          name: $(cat).text(),
        }))
        .get();
      return this.categoryRepository.create(list);
    });
    this.categoryRepository
      .save(categories)
      .then((categories) =>
        categories.forEach((category) =>
          this.queue.add(category, { jobId: category.id }),
        ),
      )
      .catch(console.error);
  }

  @Process({ concurrency: 30 })
  async fetchCategory(job: Job<Category>) {
    const category = this.categoryRepository.create(job.data)
    const candidatures = await this.html(`category/${job.data.id}`).then(
      ($) => {
        console.log('fetchCategory', job.data, category);
        const list = $('.candidature')
          .map((i, candidature) => ({
            id: parseInt(
              $(candidature).find('a').attr('href').match(/\d+$/)[0],
            ),
            category: category,
            name: $(candidature).find('h2').text(),
            user: $(candidature).find('span').text(),
            votes: parseInt($(candidature).find('.votenbr').text())
          }))
          .get();
        return this.candidatureRepository.create(list);
      },
    );
    await this.candidatureRepository.save(candidatures); //.then(console.table)
  }

  all() {
    return this.connection
    .getRepository(Category)
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.candidatures", "candidature")
    .orderBy("candidature.votes", "DESC")
    .getMany()
  }
}
