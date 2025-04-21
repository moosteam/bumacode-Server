import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expireAt: Date | null;
  
  @Column({ type: 'varchar', default: 'file' })
  fileType: 'file' | 'zip' | 'binary';
}
