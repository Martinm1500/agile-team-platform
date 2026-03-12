package dev.martinm.platform.workspaces.notes.repository;

import dev.martinm.platform.workspaces.notes.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByNotesWorkspaceId(Long notesWorkspaceId);
}
