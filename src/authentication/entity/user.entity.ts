/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ unique: true, nullable: false })
    public email: string;

    @Column({ nullable: true })
    public avatar: string;

    @Column({ nullable: true })
    public username: string;

    @Column({ default: false })
    public isEnable2fa: boolean;

    @Column({ nullable: false })
    public accessToken: string;

    @Column({ nullable: true })
    public refreshToken: string;

}

export default User;