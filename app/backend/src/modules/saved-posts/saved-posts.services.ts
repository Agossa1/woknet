import { ISavedPostsRepository } from "./saved-posts.repository";
import { ToggleSavePostDTO, SavedPost } from "./saved-posts.types";

export class SavedPostsServices {
    constructor(private readonly repository: ISavedPostsRepository) { }

    async toggleSavePost(dto: ToggleSavePostDTO) {
        return await this.repository.toggle(dto);
    }

    async getSavedPosts(profileId: string): Promise<SavedPost[]> {
        return await this.repository.findAllByProfileId(profileId);
    }
}
