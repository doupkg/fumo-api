import {
    APIInteractionResponse,
    APIMessageTopLevelComponent,
    APIModalInteractionResponse,
    ComponentType,
    InteractionResponseType,
    MessageFlags,
} from 'discord-api-types/v10'
import fumos from '@/data/fumos.json'
import { encodeBuffer } from '@/lib'

const selectMenuOptions = fumos.map((fumo) => ({
    label: fumo.name,
    value: fumo.value,
}))

const do_components = (
    _interaction: APIModalInteractionResponse,
): APIMessageTopLevelComponent[] => [
    {
        type: ComponentType.ActionRow,
        components: [
            {
                type: ComponentType.StringSelect,
                custom_id: encodeBuffer('characters_input', {}),
                max_values: fumos.length,
                options: selectMenuOptions,
            },
        ],
    },
]

export const uploadModal = {
    name: 'upload_command_modal',
    async execute(interaction: APIModalInteractionResponse): Promise<APIInteractionResponse> {
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                embeds: [
                    {
                        title: 'Preview your submittion',
                        fields: interaction.data.components.map((x) =>
                            Object({
                                name: x.components[0].custom_id,
                                value: x.components[0].value,
                            }),
                        ) as unknown as { name: string; value: string }[],
                    },
                ],
                flags: MessageFlags.Ephemeral,
                components: do_components(interaction),
            },
        }
    },
}
