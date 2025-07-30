import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class UserService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ){}


  genAccToken(payload:{id:string, role:string}):string{
    return this.jwt.sign(payload,{expiresIn:'1d'})
  }

  async checkEmail(email: string) {
    try {
      let user = await this.prisma.user.findFirst({ where: { email } });
      return user;
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException({ message: error.message });
    }
  }

   async register(data: CreateUserDto) {
    try {
      let user = await this.checkEmail(data.email);
      if(user){
        throw new BadRequestException({message: "Email already exists!"})
      }

      let hash = bcrypt.hashSync(data.password, 10)
      let newUser= await this.prisma.user.create({
        data: {...data, password: hash}
      })

      return newUser;
    } catch (error) {
      throw new InternalServerErrorException({ message: error.message });
    }
  }

  async login(data: LoginUserDto) {
    try {
      let user = await this.checkEmail(data.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        throw new BadRequestException('Wrong credentials!!');
      }
    
      let payload = { id: user.id, role: user.role };
      let accessToken = this.genAccToken(payload);

      return {accessToken};
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException({ message: error.message });
    }
  }
}
