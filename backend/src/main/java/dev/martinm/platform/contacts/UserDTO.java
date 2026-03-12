package dev.martinm.platform.contacts;

import dev.martinm.platform.users.User;
import lombok.Data;

@Data
public class UserDTO {
   private Long id;
   private String username;
   private String avatarUrl;

   public UserDTO(User user){
       this.id = user.getId();
       this.username = user.getUsername();
       this.avatarUrl = user.getAvatarUrl();
   }
}
