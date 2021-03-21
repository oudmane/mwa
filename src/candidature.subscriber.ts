import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { Candidature } from './candidature.entity';
import got from 'got'

@EventSubscriber()
export class CandidatureSubscriber
  implements EntitySubscriberInterface<Candidature> {
  constructor(
    connection: Connection,
    private elasticsearch: ElasticsearchService
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Candidature;
  }

  afterUpdate(event: UpdateEvent<Candidature>) {
    if(event.entity.votes == event.databaseEntity.votes) {
      return
    }
    const body = {
        id: event.entity.id,
        category: (event.entity as any).category.id,
        votes: event.entity.votes,
        change: event.entity.votes - event.databaseEntity.votes
    }
    console.log(body)
    this.elasticsearch.index({
        index: 'mwa_log',
        body: {
          ...body,
          timestamp: new Date(),
        }
    })
    got.post(
      'http://nchan/pubsub',
      {
        json: {
          ...body,
          timestamp: new Date(),
        }
      }
    )
  }
}
