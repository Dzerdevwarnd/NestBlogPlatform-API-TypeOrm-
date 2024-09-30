import { UsersService } from '@app/src/features/users/users.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../auth/jwt/jwtService';
import { PostLikesService } from '../postLikes/postLikes.service';

import { PostsTypeOrmRepository } from '../posts.TypeOrm.repository';

import { PostsService } from '../posts.service';

export class updatePostLikeStatusCommand {
  constructor(
    public id: string,
    public body: {
      likeStatus: string;
    },
    public accessToken: string,
  ) {}
}

@CommandHandler(updatePostLikeStatusCommand)
export class updatePostLikeStatusUseCase
  implements ICommandHandler<updatePostLikeStatusCommand>
{
  private postsRepository;
  constructor(
    protected postsTypeOrmRepository: PostsTypeOrmRepository,
    protected jwtService: JwtService,
    protected postsService: PostsService,
    protected postLikesService: PostLikesService,
    protected usersService: UsersService,
  ) {
    this.postsRepository = this.getPostsRepository();
  }

  private getPostsRepository() {
    const repositories = {
      TypeOrm: this.postsTypeOrmRepository,
    };
    return repositories[process.env.REPOSITORY] || this.postsTypeOrmRepository;
  }

  async execute(command: updatePostLikeStatusCommand): Promise<boolean> {
    const userId = await this.jwtService.verifyAndGetUserIdByToken(
      command.accessToken,
    );
    const id = command.id;
    const post: any = await this.postsService.findPost({ id }, userId);
    let likesCount = post!.extendedLikesInfo.likesCount;
    let dislikesCount = post!.extendedLikesInfo.dislikesCount;
    if (
      command.body.likeStatus === 'Like' &&
      post?.extendedLikesInfo.myStatus !== 'Like'
    ) {
      likesCount = +likesCount + 1;
      if (post?.extendedLikesInfo.myStatus === 'Dislike') {
        dislikesCount = +dislikesCount - 1;
      }
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    } else if (
      command.body.likeStatus === 'Dislike' &&
      post?.extendedLikesInfo.myStatus !== 'Dislike'
    ) {
      dislikesCount = +dislikesCount + 1;
      if (post?.extendedLikesInfo.myStatus === 'Like') {
        likesCount = +likesCount - 1;
      }
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    } else if (
      command.body.likeStatus === 'None' &&
      post?.extendedLikesInfo.myStatus === 'Like'
    ) {
      likesCount = likesCount - 1;
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    } else if (
      command.body.likeStatus === 'None' &&
      post?.extendedLikesInfo.myStatus === 'Dislike'
    ) {
      dislikesCount = dislikesCount - 1;
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    }
    const like = await this.postLikesService.findPostLikeFromUser(userId, id);
    const user = await this.usersService.findUser(userId);
    const login = user?.accountData?.login;
    if (!like) {
      await this.postLikesService.addLikeToBdFromUser(
        userId,
        id,
        command.body.likeStatus,
        login,
      );
      return true;
    } else {
      if (like.likeStatus === command.body.likeStatus) {
        return false;
      }
      this.postLikesService.updateUserLikeStatus(
        userId,
        id,
        command.body.likeStatus,
      );
      return true;
    }
  }
}
