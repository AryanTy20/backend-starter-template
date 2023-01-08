import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Refresh } from './Refresh';

@Entity('Users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn({
    type: 'smallint',
  })
  id: number;

  @Column()
  email: string;

  @Column()
  hash: string;

  @OneToOne(() => Refresh)
  token: Refresh;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
