package dev.martinm.platform.projects;

import dev.martinm.platform.projects.dto.SpecialtyDTO;
import dev.martinm.platform.projects.repository.SpecialtyRepository;
import dev.martinm.platform.projects.types.DefaultSpecialty;
import dev.martinm.platform.workspaces.kanban.KanbanPermission;
import dev.martinm.platform.workspaces.notes.NotesPermission;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class SpecialtyService {

    private final SpecialtyRepository specialtyRepository;

    public List<SpecialtyDTO> createDefaultSpecialties(Project project){
        List<Specialty> created = new ArrayList<>();

        // PROJECT_LEAD
        created.add(createSpecialtyWithPermissions(
                project,
                DefaultSpecialty.PROJECT_LEAD,
                // Notes permissions: createNote, editNote, deleteNote, moveNote, lockNote, manageCategories
                true, true, true, true, true,
                // Kanban permissions: createTask, editTask, deleteTask, moveTask, assignTask, changeTaskStatus, manageColumns
                true, true, true, true, true, true
        ));

        // CONTRIBUTOR
        created.add(createSpecialtyWithPermissions(
                project,
                DefaultSpecialty.CONTRIBUTOR,
                true, true, true, true,  false,
                true, true, true, true, true, false
        ));

        // REVIEWER
        created.add(createSpecialtyWithPermissions(
                project,
                DefaultSpecialty.REVIEWER,
                false, false, false, false, false,
                false, false, false, true, true, false
        ));

        // VIEWER
        created.add(createSpecialtyWithPermissions(
                project,
                DefaultSpecialty.VIEWER,
                false, false, false, false,  false,
                false, false, false, false, false, false
        ));

        return getSpecialtyDTOS(created);
    }

    private Specialty createSpecialtyWithPermissions(
            Project project,
            DefaultSpecialty defaultSpecialty,
            boolean createNote, boolean editNote, boolean deleteNote, boolean moveNote, boolean manageCategories,
            boolean createTask, boolean editTask, boolean deleteTask, boolean moveTask, boolean assignTask, boolean manageColumns
    ) {
        Specialty specialty = new Specialty(project, defaultSpecialty.getName(), defaultSpecialty.getDescription());

        // Set NotesPermission
        NotesPermission notesPermission = new NotesPermission(specialty, createNote,editNote,deleteNote,moveNote, manageCategories);

        specialty.setNotesPermission(notesPermission);

        // Set KanbanPermission
        KanbanPermission kanbanPermission = new KanbanPermission(specialty,createTask,editTask,deleteTask,moveTask,assignTask,manageColumns);

        specialty.setKanbanPermission(kanbanPermission);

        return specialtyRepository.save(specialty);
    }

    public Specialty getProjectLeadSpecialtyByProjectId(Long projectId){
        return specialtyRepository.findByProjectIdAndName(projectId, DefaultSpecialty.PROJECT_LEAD.getName()).orElseThrow(() -> new RuntimeException("Specialty not found"));
    }

    public Specialty getContributorSpecialtyByProjectId(Long projectId){
        return specialtyRepository.findByProjectIdAndName(projectId, DefaultSpecialty.CONTRIBUTOR.getName()).orElseThrow(() -> new RuntimeException("Specialty not found"));
    }

    public List<SpecialtyDTO> getSpecialtiesByProjectId(Long projectId){
        List<Specialty> specialties = specialtyRepository.findByProjectId(projectId);

        List<SpecialtyDTO> specialtyDTOS = new ArrayList<>();

        for(Specialty specialty : specialties){
            specialtyDTOS.add(new SpecialtyDTO(specialty));
        }
        return specialtyDTOS;
    }

    public SpecialtyDTO getSpecialtyById(Long id) {
        Specialty specialty = specialtyRepository.findById(id).orElseThrow(() -> new RuntimeException("Specialty not found"));
        return new SpecialtyDTO(specialty);
    }

    public List<SpecialtyDTO> getAllSpecialtiesForProject(Long projectId) {
        List<Specialty> specialties = specialtyRepository.findByProjectId(projectId);
        List<SpecialtyDTO> specialtyDTOS = new ArrayList<>();

        for(Specialty specialty: specialties){
            specialtyDTOS.add(new SpecialtyDTO(specialty));
        }

        return specialtyDTOS;
    }

    private static List<SpecialtyDTO> getSpecialtyDTOS(List<Specialty> created) {
        List<SpecialtyDTO> specialtyDTOS = new ArrayList<>();

        for (Specialty specialty : created) {
            specialtyDTOS.add(new SpecialtyDTO(specialty));
        }
        return specialtyDTOS;
    }

}