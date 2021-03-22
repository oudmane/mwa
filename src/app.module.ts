import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Candidature } from './candidature.entity';
import { CandidatureSubscriber } from './candidature.subscriber';
import { Category } from './category.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql',
      port: 3306,
      username: 'root',
      password: 'toor',
      database: 'mwa',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Category, Candidature]),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      prefix: 'bull',
      redis: {
        host: 'redis',
        port: 6379,
        keyPrefix: 'mwa'
      },
    }),
    BullModule.registerQueue({
      name: 'crawl',
      defaultJobOptions: {
        // attempts: 1,
        removeOnComplete: true,
        removeOnFail: true,
        timeout: 4000,
        // backoff: {
        //   type: 'exponential',
        //   delay: 1000 * 3,
        // },
      },
    }),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200'
    })
  ],
  controllers: [AppController],
  providers: [AppService, CandidatureSubscriber],
})
export class AppModule {}
