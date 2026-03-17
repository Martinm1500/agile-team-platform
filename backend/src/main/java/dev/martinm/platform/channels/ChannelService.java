package dev.martinm.platform.channels;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.messages.Conversation;
import dev.martinm.platform.messages.ConversationRepository;
import dev.martinm.platform.projects.Project;
import dev.martinm.platform.servers.Server;
import dev.martinm.platform.servers.repository.ServerRepository;
import dev.martinm.platform.roles.PermissionType;
import dev.martinm.platform.servers.ServerPermissionService;
import dev.martinm.platform.users.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ChannelService {
    private final ChannelRepository channelRepository;
    private final ServerRepository serverRepository;
    private final ServerPermissionService serverPermissionService;
    private final ConversationRepository conversationRepository;
    private final UserContextService userContextService;

    public ChannelDTO createChannel(ChannelDTO dto) {
        Long serverId = dto.getServerId();

        validateChannelDTO(dto);

        serverPermissionService.checkServerPermission(serverId, PermissionType.MANAGE_CHANNELS, getAuthenticatedUser());

        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new RuntimeException("Server not found"));

        Channel savedChannel = channelRepository.save(new Channel(server, dto.getName(), dto.getType()));

        if(savedChannel.getType() == ChannelType.TEXT){
            Conversation c = Conversation.forChannel(savedChannel);
            conversationRepository.save(c);
        }

        return new ChannelDTO(savedChannel);
    }

    public ChannelDTO getChannelById(Long id) {
        Channel channel = channelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Channel not found"));
        serverPermissionService.checkIsServerMember(channel.getServer().getId(), getAuthenticatedUser());
        return new ChannelDTO(channel);
    }

    public ChannelDTO updateChannel(Long id, ChannelDTO dto) {
        Channel channel = channelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        serverPermissionService.checkServerPermission(channel.getServer().getId(), PermissionType.MANAGE_CHANNELS, getAuthenticatedUser());
        channel.setName(dto.getName());
        channel.setType(dto.getType());

        return new ChannelDTO(channelRepository.save(channel));
    }

    public void deleteChannel(Long id) {
        Channel channel = channelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Channel not found"));
        serverPermissionService.checkServerPermission(channel.getServer().getId(), PermissionType.MANAGE_CHANNELS, getAuthenticatedUser());
        channelRepository.deleteById(id);
    }

    public List<ChannelDTO> getChannelsForServer(Long serverId) {
        serverPermissionService.checkIsServerMember(serverId, getAuthenticatedUser());
        List<Channel> channels = channelRepository.findByServerId(serverId);
        List<ChannelDTO> channelDTOS = new ArrayList<>();

        for (Channel channel : channels) {
            channelDTOS.add(new ChannelDTO(channel));
        }
        return channelDTOS;
    }

    public List<ChannelDTO> createDefaultChannelsForServer(Server server) {
        if (server == null || server.getId() == null) {
            throw new IllegalArgumentException("Server must be persisted before creating default channels");
        }
        Channel textChannel1 = new Channel(server, DefaultChannelNames.TEXT_GENERAL , ChannelType.TEXT );
        Conversation c1 = Conversation.forChannel(textChannel1);
        conversationRepository.save(c1);

        Channel textChannel2 = new Channel(server, DefaultChannelNames.TEXT_DISCUSSIONS , ChannelType.TEXT );
        Conversation c2 = Conversation.forChannel(textChannel2);
        conversationRepository.save(c2);

        Channel voiceChannel1 = new Channel(server, DefaultChannelNames.VOICE_PRINCIPAL , ChannelType.VOICE );
        Channel voiceChannel2 = new Channel(server, DefaultChannelNames.VOICE_MEETINGS , ChannelType.VOICE );

        List<Channel> persistedChannels = channelRepository.saveAll(List.of(textChannel1, textChannel2, voiceChannel1, voiceChannel2));

        return channelsToListDTO(persistedChannels);
    }

    public List<ChannelDTO> createDefaultChannelsForProject(Project project, Server server) {
        if (project == null || project.getId() == null) {
            throw new IllegalArgumentException("Project must be persisted before creating default channels");
        }

        String projectName = project.getName().trim().replaceAll("\\s+", "-").toLowerCase();

        String textChannelName = projectName + "-text";
        String voiceChannelName = projectName + "-voice";

        Channel textChannel = new Channel(server,project, textChannelName, ChannelType.TEXT);
        Channel savedTextChannel = channelRepository.save(textChannel);

        Conversation c = Conversation.forChannel(savedTextChannel);
        conversationRepository.save(c);

        Channel voiceChannel = new Channel(server,project, voiceChannelName, ChannelType.VOICE);
        Channel savedVoiceChannel = channelRepository.save(voiceChannel);

        List<Channel> persistedChannels = List.of(savedTextChannel,savedVoiceChannel);

        return channelsToListDTO(persistedChannels);
    }

    public List<ChannelDTO> getChannelsForProject(Long projectId){
        return channelsToListDTO(channelRepository.findByProjectId(projectId));
    }

    private void validateChannelDTO(ChannelDTO dto) {
        if (dto.getServerId() == null) {
            throw new RuntimeException("ServerId is required");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new RuntimeException("Channel name is required");
        }
    }

    private List<ChannelDTO> channelsToListDTO(List<Channel> channels){
        List<ChannelDTO> dtos = new ArrayList<>();
        for(Channel channel : channels){
            dtos.add(new ChannelDTO(channel));
        }
        return dtos;
    }
    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }
}