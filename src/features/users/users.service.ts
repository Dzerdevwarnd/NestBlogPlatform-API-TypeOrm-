import { RefreshTokensMetaService } from '@app/src/features/refreshTokenMeta/refreshTokenMeta.service';
import { Injectable } from '@nestjs/common';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '../auth/jwt/jwtService';
import { UserEntity } from './users.entity';
import { UserDbType, userViewType, usersPaginationType } from './users.types';

import { UsersTypeOrmRepository } from './usersTypeOrm.Repository';
import bcrypt = require('bcrypt');
///
@Injectable()
export class UsersService {
  private usersRepository;
  constructor(
    protected usersTypeOrmRepository: UsersTypeOrmRepository,
    protected jwtService: JwtService,
    protected refreshTokensMetaService: RefreshTokensMetaService,
  ) {
    this.usersRepository = this.getUsersRepository();
  }

  private getUsersRepository() {
    const repositories = {
      TypeOrm: this.usersTypeOrmRepository,
    };

    return repositories[process.env.REPOSITORY] || this.usersTypeOrmRepository;
  }

  async findUser(id: string) {
    const user = await this.usersRepository.findUser(id);
    return user;
  }

  async findDBUser(loginOrEmail) {
    return await this.usersRepository.findDBUser(loginOrEmail);
  }

  async returnUsersWithPagination(query: any): Promise<usersPaginationType> {
    return await this.usersRepository.returnUsersWithPagination(query);
  }
  async createUser(body: {
    login: string;
    password: string;
    email: string;
  }): Promise<userViewType> {
    const passwordSalt = await this.generateSalt();
    const passwordHash = await this.generateHash(body.password, passwordSalt);
    const createdDate = new Date();
    const newUser: UserDbType = {
      id: String(Date.now()),
      accountData: {
        login: body.login,
        email: body.email,
        createdAt: createdDate,
        passwordSalt: passwordSalt,
        passwordHash: passwordHash,
      },
      emailConfirmationData: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
        isConfirmed: false,
      },
    };
    const userView = await this.usersRepository.createUser(newUser);
    return userView;
  }
  async deleteUser(params: { id: string }): Promise<boolean> {
    const resultBoolean = await this.usersRepository.deleteUser(params);
    return resultBoolean;
  }
  async generateHash(password: string, passwordSalt: string) {
    const hash = await bcrypt.hash(password, passwordSalt);
    return hash;
  }
  async generateSalt() {
    const salt = await bcrypt.genSalt(10);
    return salt;
  }
  async checkCredentialsAndReturnUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDbType | undefined> {
    const user = await this.usersRepository.findDBUser(loginOrEmail);
    if (!user) {
      return undefined;
    }
    const passwordSalt = user.accountData?.passwordSalt || user.passwordSalt;
    const passwordHash = user.accountData?.passwordHash || user.passwordHash;
    const passwordNowGenerateHash = await this.generateHash(
      password,
      passwordSalt,
    );
    if (passwordHash !== passwordNowGenerateHash) {
      return undefined;
    } else {
      return user;
    } //
  }
  async userEmailConfirmationAccept(confirmationCode: any): Promise<boolean> {
    const isConfirmationAccept =
      await this.usersRepository.userEmailConfirmationAccept(confirmationCode);
    return isConfirmationAccept;
  }
  async findDBUserByConfirmationCode(confirmationCode: any) {
    const user =
      await this.usersRepository.findDBUserByConfirmationCode(confirmationCode);
    return user;
  }
  async getUserIdFromRefreshToken(
    refreshToken: string,
  ): Promise<string | undefined> {
    const deviceId =
      await this.jwtService.verifyAndGetDeviceIdByToken(refreshToken);
    const userId =
      await this.refreshTokensMetaService.findUserIdByDeviceId(deviceId);
    return userId;
  }

  async updateRecoveryCode(
    email: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const result = await this.usersRepository.updateRecoveryCode(
      email,
      recoveryCode,
    );
    return result;
  }
  async updateUserPassword(
    recoveryCode: string,
    newPassword: string,
  ): Promise<boolean> {
    const passwordSalt = await this.generateSalt();
    const passwordHash = await this.generateHash(newPassword, passwordSalt);
    const result = await this.usersRepository.updateUserSaltAndHash(
      recoveryCode,
      passwordSalt,
      passwordHash,
    );
    return result;
  }

  async userConfirmationCodeUpdate(email: string) {
    const resultOfUpdate =
      await this.usersRepository.userConfirmationCodeUpdate(email);
    if (resultOfUpdate) {
      return resultOfUpdate;
    } else {
      return;
    }
  }

  async updateUserQuizGameCurrentId(
    userId: string,
    currentGameId: string | null,
  ) {
    const resultOfUpdate =
      await this.usersRepository.updateUserQuizGameCurrentId(
        userId,
        currentGameId,
      );
    if (resultOfUpdate) {
      return resultOfUpdate;
    } else {
      return;
    }
  }

  async updateUserQuizGameScore(userId: string, quizScore) {
    const user: UserEntity = await this.findUser(userId);
    const totalScore = quizScore + user.quizGameDate.score;
    const resultOfUpdate = await this.usersRepository.updateUserQuizGameScore(
      userId,
      totalScore,
    );
    if (resultOfUpdate) {
      return resultOfUpdate;
    } else {
      return;
    }
  }

  async findUserCurrentGameId(userId: string): Promise<string | null> {
    const gameId = await this.usersRepository.findUserCurrentGameId(userId);
    return gameId;
  }
}
