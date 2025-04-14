import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';

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
  
  @Column({ type: 'varchar', default: 'file' })
  fileType: string;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  }
}
