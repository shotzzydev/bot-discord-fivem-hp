import { Command, Component } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { createModalInput, hexToRgb } from "@magicyan/discord";
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelType, ComponentType, EmbedBuilder, TextChannel, TextInputStyle } from "discord.js";

new Command({
    name: "setagem",
    description: "Configure o canal onde os membros realizara",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [
        {
            name: "canal",
            description: "Selecione o canal onde será enviado a embed",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
        },
        {
            name: "canal-logs",
            description: "Selecione onde as logs das pessoas que realizaram o formulario",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
        }
    ],
    async run(interaction) {
        const { options, guild } = interaction;

        const channel = options.getChannel("canal", true, [ChannelType.GuildText]);
        const logs = options.getChannel("canal-logs", true, [ChannelType.GuildText]);

        await db.guilds.upset(db.guilds.id(guild.id), {
            FormHp: {
                channel: logs.id
            }
        });

        const embed = new EmbedBuilder({
            title: "FORMULARIO HP",
            description: "> Tem interesse de fazer parte do **HP**?\n> Clique no botão abaixo para está realizando o formulario com suas informações de dentro da cidade! após o envio aguarde em quanto nosso responsáveis estára analizando seu formalulario boa sorte a todos",
            thumbnail: { url: `${guild.iconURL() || undefined}` },
            image: {
                url: `https://cdn.discordapp.com/attachments/1153871590824607764/1235319226785595392/formulario.png?ex=6633f02e&is=66329eae&hm=fdb5955680d71b458a1e0a7b016e4df3e25cedd609cc73d3b633fd41a54c7b4c&`
            },
            color: hexToRgb(settings.colors.primary),
        });
        const button = new ButtonBuilder({
            customId: "button-formulario-modal",
            style: ButtonStyle.Secondary,
            label: "Formulario",
            emoji: "📝"
        });

        const row = new ActionRowBuilder<ButtonBuilder>({ components: [button] });
        channel.send({ embeds: [embed], components: [row] });
        interaction.reply({
            ephemeral: true,
            content: `Sistema de formulario configurado com sucesso no canal: ${channel}`
        })
    },
})

new Component({
    customId: "button-formulario-modal",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        const { user, guild } = interaction;
        const guildDocument = await db.guilds.get(db.guilds.id(guild.id));

        const channel = guildDocument?.data.FormHp?.channel;

        interaction.showModal({
            customId: "modalliberar",
            title: "Formulário HP",
            components: [
                createModalInput({
                    customId: "personagem",
                    label: "Nome & Sobrenome do personagem:",
                    placeholder: "Nome você usará para o personagem na cidade",
                    style: TextInputStyle.Short,
                    minLength: 5,
                    maxLength: 32,
                    required: true,
                }),
                createModalInput({
                    customId: "id",
                    label: "Passaporte",
                    placeholder: "Seu ID que é informado na mensagem do FIVEM",
                    style: TextInputStyle.Short,
                    maxLength: 20,
                    required: true,
                }),
                createModalInput({
                    customId: "modal-input-idade",
                    label: "Idade",
                    placeholder: "Sua Idade que é informado no seu Inventario",
                    style: TextInputStyle.Short,
                    maxLength: 20,
                    required: true,
                }),
                createModalInput({
                    customId: "modal-input-telefone",
                    label: "Telefone",
                    placeholder: "Seu telefone que é informado no seu Inventario",
                    style: TextInputStyle.Short,
                    maxLength: 7,
                    required: true,
                }),
                createModalInput({
                    customId: "modal-input-turno",
                    label: "Turno",
                    placeholder: "Qual Seu Turno disponível para você?",
                    style: TextInputStyle.Short,
                    maxLength: 6,
                    required: true,
                }),
            ]
        })

        const modalIteraction = await interaction.awaitModalSubmit({ time: 30_000, filter: (i) => i.user.id == interaction.user.id }).catch(() => null);
        if (!modalIteraction) return;

        const { fields } = modalIteraction;
        const name = fields.getTextInputValue("personagem");
        const passaporte = fields.getTextInputValue("id");
        const idade = fields.getTextInputValue("modal-input-idade");
        const telefone = fields.getTextInputValue("modal-input-telefone");
        const turno = fields.getTextInputValue("modal-input-turno");

        const embed = new EmbedBuilder({
            author: {
                name: `NOVA SOLICITAÇÃO DE RECRUTAMENTO`,
                iconURL: `${guild.iconURL() || undefined}`,
            },
            description: `> Nome: **${name}**\n\n> Passaporte: **${passaporte}**\n\n> Idade: **${idade}**\n\n> Telefone: **${telefone}**\n\n> Turno: **${turno}**\n\nSelecione a opção desejadá abaixo:`,
            thumbnail: {
                url: `${user.avatarURL() || undefined}`
            },
            color: hexToRgb(settings.colors.default)
        });

        await modalIteraction.reply({
            ephemeral: true,
            content: `${user}, Seu formulário foi enviado com sucesso.`
        });

        const aprovado = new ButtonBuilder({
            customId: `button/:aprovado/:${user.id}`,
            style: ButtonStyle.Success,
            label: "Aprovado",
        });

        const reprovado = new ButtonBuilder({
            customId: `button/:reprovado/:${user.id}`,
            style: ButtonStyle.Danger,
            label: "Repovado",
        });

        const row = new ActionRowBuilder<ButtonBuilder>({ components: [aprovado, reprovado] })

        const channelform = channel ? guild.channels.cache.get(channel) : null;
        if (channelform instanceof TextChannel) {
            channelform.send({ embeds: [embed], components: [row] })
        }
    },
});

new Component({
    customId: "button/:type/:user_name",
    type: ComponentType.Button,
    cache: "cached",
    async run(interaction, { type, user_name }) {
        const { user } = interaction;
        // const selected = customId.replace("button/:type:user", "")

        switch (type) {
            case "": {
                interaction.reply({ content: `${user_name}, Você aprovou com sucesso por ${user}` })
            }
            case "": {
                interaction.reply({ content: `${user_name}, Você reprovou com sucesso por ${user}` })
            }
        }
        return
    },
})