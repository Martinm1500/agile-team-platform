package dev.martinm.platform.workspaces.kanban;

import dev.martinm.platform.workspaces.kanban.dto.ColumnDTO;
import dev.martinm.platform.workspaces.kanban.repository.ColumnRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ColumnService {

    private final ColumnRepository columnRepository;

    public List<ColumnDTO> createDefaultColumns(KanbanWorkspace workspace){
        Column todo = new Column(workspace,"To Do", 0, TaskStatus.TODO);
        Column inProgress = new Column(workspace,"In Progress", 1, TaskStatus.IN_PROGRESS);
        Column review = new Column(workspace,"Review", 2, TaskStatus.REVIEW);
        Column done = new Column(workspace,"Done", 3, TaskStatus.DONE);

        Column savedTodo = columnRepository.save(todo);
        Column savedInProgress = columnRepository.save(inProgress);
        Column savedReview = columnRepository.save(review);
        Column savedDone =columnRepository.save(done);

        return List.of(new ColumnDTO(savedTodo),new ColumnDTO(savedInProgress), new ColumnDTO(savedReview), new ColumnDTO(savedDone));

    }

    public List<ColumnDTO> getColumns(Long workspaceId){
        List<Column> columns = columnRepository.findByKanbanIdOrderByOrderPosition(workspaceId);
        List<ColumnDTO> columnDTOS = new ArrayList<>();

        for(Column column : columns){
            columnDTOS.add(new ColumnDTO(column));
        }

        return columnDTOS;
    }

}
