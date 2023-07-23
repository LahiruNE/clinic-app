import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Patient
{
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column()
    createdBy!: string;

    @Column()
	createdDate!: Date;
}