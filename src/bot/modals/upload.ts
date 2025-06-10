import {
    APIInteractionResponse,
    APIMessageTopLevelComponent,
    APIModalInteractionResponse,
    ButtonStyle,
    ComponentType,
    InteractionResponseType,
    MessageFlags,
} from 'discord-api-types/v10'
import Characters from '@/data/characters.json'
import { encodeBuffer } from '@/lib'

const selectMenuOptions = Characters.map((fumo) => ({
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
                max_values: Characters.length,
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
                                value: x.components[0].value
                                    ?.toLowerCase()
                                    .replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                                        letter.toUpperCase(),
                                    ),
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
