import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Candidature } from './candidature.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Candidature, candidature => candidature.category)
  candidatures: Candidature[];
}