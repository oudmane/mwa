import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { Candidature } from './candidature.entity';

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
    const body = {
        id: event.entity.id,
        category: event.entity.category,
        votes: event.entity.votes,
        change: event.entity.votes - event.databaseEntity.votes,
        timestamp: new Date(),
    }
    console.log(body)
    this.elasticsearch.index({
        index: 'mwa_log',
        body
    })
  }
}
