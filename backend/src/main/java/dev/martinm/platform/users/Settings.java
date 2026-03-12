package dev.martinm.platform.users;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_settings")
@Data
public class Settings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private boolean showCurrentActivity = true;

    private boolean allowDmsFromContacts = true;

    public Settings(User user){
        this.user = user;
    }

    public Settings(){}
}
