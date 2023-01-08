import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity('RefreshTokens')
export class Refresh {
  @PrimaryGeneratedColumn({
    type: 'smallint',
  })
  id: number;

  @Column({ nullable: true, unique: true })
  hash: string;

  @OneToOne(() => User, (user) => user.token, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
