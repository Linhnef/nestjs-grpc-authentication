/* eslint-disable prettier/prettier */
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('tokens')
class Token {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ unique: true, nullable: false })
    public userId: string;

    @Column({ nullable: false })
    public accessToken: string;

    @Column({ nullable: true })
    public refreshToken: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

}

export default Token;