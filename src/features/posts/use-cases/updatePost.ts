import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsTypeOrmRepository } from '../posts.TypeOrm.repository';

export class updatePostCommand {
  constructor(
    public id: string,
    public body: {
      title: string;
      shortDescription: string;
      content: string;
      blogId?: string;
    },
  ) {}
}

@CommandHandler(updatePostCommand)
export class updatePostUseCase implements ICommandHandler<updatePostCommand> {
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
  async execute(command: updatePostCommand): Promise<boolean> {
    const resultBoolean = this.postsRepository.updatePost(
      command.id,
      command.body,
    );
    return resultBoolean;
  }
}
