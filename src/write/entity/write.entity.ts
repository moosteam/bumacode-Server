import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Write {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  filePath: string | null;

  @Column({ type: 'varchar', nullable: true })
  userIp: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
