import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlackListTokenEntity } from '../blacklistTokens/blacklistTokens.entitiy';
import { RefreshTokenMetaEntity } from '../refreshTokenMeta/refreshTokenMeta.entity';
import { UserEntity } from '../users/users.entity';
import { TestingController } from './testing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenMetaEntity,
      BlackListTokenEntity,
    ]),
  ],
  controllers: [TestingController],
  providers: [],
  exports: [],
})
export class TestingModule {}
///
