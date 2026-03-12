package dev.martinm.platform.workspaces.notes;

import dev.martinm.platform.auth.UserContextService;
import dev.martinm.platform.projects.ProjectPermissionService;
import dev.martinm.platform.projects.types.NotesPermissionType;
import dev.martinm.platform.users.User;
import dev.martinm.platform.workspaces.notes.dto.NoteDTO;
import dev.martinm.platform.workspaces.notes.repository.NoteRepository;
import dev.martinm.platform.workspaces.notes.repository.NotesWorkspaceRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;
    private final NotesWorkspaceRepository notesWorkspaceRepository;
    private final ProjectPermissionService projectPermissionService;
    private final UserContextService userContextService;

    public NoteDTO createNote(NoteDTO dto) {
        NotesWorkspace workspace = notesWorkspaceRepository.findById(dto.getWorkspaceId())
                .orElseThrow(() -> new RuntimeException("Notes workspace not found"));

        if (workspace.getProject() != null) {
            Long projectId = workspace.getProject().getId();
            Long userId = getAuthenticatedUser().getId();
            projectPermissionService.checkNotesPermission(projectId, userId, NotesPermissionType.CREATE_NOTE);
        } else {
            if (!workspace.getCreator().equals(getAuthenticatedUser())) {
                throw new RuntimeException("User is not the workspace creator");
            }
        }

        Note note = new Note(workspace, dto.getTitle(), dto.getContent(), dto.getSummary(), dto.getTopics(),
                dto.getSources(), dto.getInsights(), dto.getType(), dto.getPosition(), getAuthenticatedUser());

        return new NoteDTO(noteRepository.save(note));
    }

    public NoteDTO editNote(NoteDTO dto) {
        Note note = noteRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (note.getNotesWorkspace().getProject() != null) {
            projectPermissionService.checkNotesPermission(
                    note.getNotesWorkspace().getProject().getId(),
                    getAuthenticatedUser().getId(),
                    NotesPermissionType.EDIT_NOTE
            );
        }else if (!note.getNotesWorkspace().getCreator().equals(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the workspace creator");
        }

        note.setTitle(dto.getTitle() != null ? dto.getTitle() : note.getTitle());
        note.setContent(dto.getContent() != null ? dto.getContent() : note.getContent());
        note.setSummary(dto.getSummary() != null ? dto.getSummary() : note.getSummary());
        note.setTopics(dto.getTopics() != null ? dto.getTopics() : note.getTopics());
        note.setSources(dto.getSources() != null ? dto.getSources() : note.getSources());
        note.setInsights(dto.getInsights() != null ? dto.getInsights() : note.getInsights());
        note.setType(dto.getType() != null ? dto.getType() : note.getType());
        note.setPosition(dto.getPosition() != null ? dto.getPosition() : note.getPosition());

        return new NoteDTO(noteRepository.save(note));
    }

    public NoteDTO moveNote(NoteDTO dto) {
       Note note = noteRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (note.getNotesWorkspace().getProject() != null) {
            projectPermissionService.checkNotesPermission(
                    note.getNotesWorkspace().getProject().getId(),
                    getAuthenticatedUser().getId(),
                    NotesPermissionType.MOVE_NOTE
            );
        }else if (!note.getNotesWorkspace().getCreator().equals(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the workspace creator");
        }

        note.setPosition(dto.getPosition() != null ? dto.getPosition() : note.getPosition());

        return new NoteDTO(noteRepository.save(note));
    }

    public List<NoteDTO> getAllNotesForWorkspace(Long workspaceId) {
        NotesWorkspace workspace = notesWorkspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Notes workspace not found"));

        if (workspace.getProject() != null) {
            projectPermissionService.checkIsProjectMember(workspace.getProject().getId(), getAuthenticatedUser().getId());
        } else if (!workspace.getCreator().equals(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the NotesWorkspace creator");
        }

        return convertToNotesListDTO(noteRepository.findByNotesWorkspaceId(workspaceId));
    }

    public void deleteNote(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (note.getNotesWorkspace().getProject() != null) {
            projectPermissionService.checkNotesPermission(
                    note.getNotesWorkspace().getProject().getId(),
                    getAuthenticatedUser().getId(),
                    NotesPermissionType.DELETE_NOTE
            );
        }else if (!note.getNotesWorkspace().getCreator().equals(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the workspace creator");
        }

        noteRepository.deleteById(id);
    }

    public NoteDTO getNoteById(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        NotesWorkspace workspace = notesWorkspaceRepository.findById(note.getNotesWorkspace().getId())
                .orElseThrow(() -> new RuntimeException("Notes workspace not found"));

        if (workspace.getProject() != null) {
            projectPermissionService.checkIsProjectMember(workspace.getProject().getId(), getAuthenticatedUser().getId());
        } else if (!workspace.getCreator().equals(getAuthenticatedUser())) {
            throw new RuntimeException("User is not the workspace creator");
        }

        return new NoteDTO(note);
    }

    private List<NoteDTO> convertToNotesListDTO(List<Note> notes) {
        List<NoteDTO> dtos = new ArrayList<>();
        for (Note note : notes) {
            dtos.add(new NoteDTO(note));
        }
        return dtos;
    }

    private User getAuthenticatedUser() {
        return userContextService.getAuthenticatedUser();
    }
}
