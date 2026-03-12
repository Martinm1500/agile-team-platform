package dev.martinm.platform.projects.types;

import lombok.Getter;

@Getter
public enum DefaultSpecialty {
    PROJECT_LEAD("PROJECT_LEAD", "Full control over the project and all its tools."),
    CONTRIBUTOR("CONTRIBUTOR", "Active member who can create and modify content but cannot manage structure."),
    REVIEWER("REVIEWER", "Can review and move items between states but cannot create new content."),
    VIEWER("VIEWER", "Read-only access to the entire project.");

    private final String name;
    private final String description;

    DefaultSpecialty(String name, String description) {
        this.name = name;
        this.description = description;
    }
}

