import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Candidature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: number;

  @Column()
  name: string;

  @Column()
  user: string;

  @Column()
  votes: number;
}