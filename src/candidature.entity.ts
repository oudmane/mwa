import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Candidature {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // @JoinColumn()
  @ManyToOne(() => Category, category => category.candidatures)
  category: Category;

  @Column()
  name: string;

  @Column()
  user: string;

  @Column()
  votes: number;
}