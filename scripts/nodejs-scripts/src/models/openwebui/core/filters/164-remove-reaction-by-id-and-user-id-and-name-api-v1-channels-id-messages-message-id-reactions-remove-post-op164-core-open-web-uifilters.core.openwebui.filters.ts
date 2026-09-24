import type { OpenWebUICore } from '../../../../models/index.model.ts';

export interface RemoveReactionByIdAndUserIdAndNameApiV1ChannelsIdMessagesMessageIdReactionsRemovePostOp164CoreOpenWebUIFilters {
    path: { id: string; message_id: string };
    body: OpenWebUICore.Model.ReactionForm;
}
