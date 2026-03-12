package dev.martinm.platform.workspaces.kanban;

import dev.martinm.platform.users.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "tasks")
@Data
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kanban_id", nullable = false)
    private KanbanWorkspace kanban;

    private String title;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id", nullable = false)
    private Column column;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    @ManyToOne
    @JoinColumn(name = "assignee_user_id")
    private User assignee;

    private Timestamp dueDate;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    public Task(KanbanWorkspace workspace, String title, String description, Column column, User creator){
        this.kanban = workspace;
        this.title = title;
        this.description = description;
        this.column = column;
        this.status = column.getStatus();
        this.creator = creator;
    }

    public Task(KanbanWorkspace workspace, String title, String description, Column column){
        this.kanban = workspace;
        this.title = title;
        this.description = description;
        this.column = column;
        this.status = column.getStatus();
    }

    public Task(){}
}
