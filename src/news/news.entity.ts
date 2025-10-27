import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('news')
export class NewsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  symbol: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  title_zh: string;

  @Column({ type: 'text' })
  content_zh: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text' })
  source: string;

  @CreateDateColumn({ type: 'text' })
  createdAt: string;
}
