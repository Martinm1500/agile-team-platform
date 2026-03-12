package dev.martinm.platform.channels;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChannelController {
    private final ChannelService channelService;

    @PostMapping("/channels")
    public ResponseEntity<ChannelDTO> createChannel(@RequestBody ChannelDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(channelService.createChannel(dto));
    }


    @GetMapping("/channels/{id}")
    public ResponseEntity<ChannelDTO> getChannelById(@PathVariable Long id) {
        return ResponseEntity.ok(channelService.getChannelById(id));
    }

    @GetMapping("/servers/{serverId}/channels")
    public ResponseEntity<List<ChannelDTO>> getAllChannelsForServer(@PathVariable Long serverId) {
        return ResponseEntity.ok(channelService.getChannelsForServer(serverId));
    }

    @PutMapping("/channels/{id}")
    public ResponseEntity<ChannelDTO> updateChannel(@PathVariable Long id, @RequestBody ChannelDTO dto) {
        return ResponseEntity.ok(channelService.updateChannel(id, dto));
    }

    @DeleteMapping("/channels/{id}")
    public ResponseEntity<Void> deleteChannel(@PathVariable Long id) {
        channelService.deleteChannel(id);
        return ResponseEntity.noContent().build();
    }
}