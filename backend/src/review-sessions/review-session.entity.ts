import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../users/user.entity";
import { Project } from "../projects/project.entity";

@Entity("review_sessions")
export class ReviewSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  projectId: string;

  @Column()
  creatorId: string;

  @Column({ type: "jsonb", nullable: true })
  settings: any;

  @Column({ default: "active" })
  status: "active" | "completed" | "archived";

  @ManyToOne(() => Project, { onDelete: "CASCADE" })
  project: Project;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
