package dev.martinm.platform.users;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.contacts.UserDTO;
import dev.martinm.platform.users.dto.ProfileDTO;
import dev.martinm.platform.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserContextService userContextService;

    public ProfileDTO getProfile() {
        return new ProfileDTO(getAuthenticatedUser());
    }

    @Transactional
    public ProfileDTO updateProfile(ProfileDTO dto) {
        User authenticatedUser = getAuthenticatedUser();

        if (dto.getAvatarUrl() != null) {
            authenticatedUser.setAvatarUrl(dto.getAvatarUrl());
        }

        if(dto.getEmail() != null){
            authenticatedUser.setEmail(dto.getEmail());
        }

        if(dto.getPassword() != null){
            authenticatedUser.setPassword(dto.getPassword());
        }

        if(dto.getStatus() != null){
            authenticatedUser.setStatus(dto.getStatus());
        }

        if(dto.getDisplayname() != null){
            authenticatedUser.setDisplayname(dto.getDisplayname());
        }

        User updatedUser = userRepository.save(authenticatedUser);

        return new ProfileDTO(updatedUser);
    }

    @Transactional
    public void deleteAcount() {
        userRepository.deleteById(getAuthenticatedUser().getId());
    }

    public UserDTO getByUsername(String username){
        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new RuntimeException("User not found"));
        return new UserDTO(user);
    }

    private User getAuthenticatedUser(){
        return userContextService.getAuthenticatedUser();
    }
}
