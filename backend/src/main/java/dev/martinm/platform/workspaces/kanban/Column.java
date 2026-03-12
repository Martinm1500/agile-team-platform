package dev.martinm.platform.workspaces.kanban;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "kanban_columns")
@Data
public class Column {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "kanban_id")
    private KanbanWorkspace kanban;

    private String name;

    private int orderPosition;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    @OneToMany(mappedBy = "column", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Task> tasks;

    public Column(KanbanWorkspace workspace, String name, int orderPosition, TaskStatus status){
        this.kanban = workspace;
        this.name = name;
        this.orderPosition = orderPosition;
        this.status = status;
    }

    public Column(){}
}
