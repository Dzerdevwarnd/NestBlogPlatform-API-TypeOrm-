import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsTypeOrmRepository } from '../posts.TypeOrm.repository';

export class deletePostCommand {
  constructor(public params: { blogId?: string; postId: string }) {}
}

@CommandHandler(deletePostCommand)
export class deletePostUseCase implements ICommandHandler<deletePostCommand> {
  private postsRepository;
  constructor(protected postsTypeOrmRepository: PostsTypeOrmRepository) {
    this.postsRepository = this.getPostsRepository();
  }

  private getPostsRepository() {
    const repositories = {
      TypeOrm: this.postsTypeOrmRepository,
    };

    return repositories[process.env.REPOSITORY] || this.postsTypeOrmRepository;
  }
  async execute(command: deletePostCommand): Promise<boolean> {
    const resultBoolean = this.postsRepository.deletePost(command.params);
    return resultBoolean;
  }
}
