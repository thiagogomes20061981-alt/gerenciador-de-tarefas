package com.example.tasks.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.example.tasks.task.dto.TaskRequest;
import com.example.tasks.task.dto.TaskResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock TaskRepository repository;
    @InjectMocks TaskService service;

    private Task task(Long id, String title, boolean done) {
        Task t = new Task();
        t.setId(id);
        t.setTitle(title);
        t.setDone(done);
        t.setCreatedAt(LocalDateTime.of(2025, 1, 1, 10, 0));
        return t;
    }

    @Test
    void findAll_returnsMappedResponses() {
        when(repository.findAll()).thenReturn(List.of(task(1L, "A", false), task(2L, "B", true)));

        List<TaskResponse> result = service.findAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(1).title()).isEqualTo("B");
        assertThat(result.get(1).done()).isTrue();
    }

    @Test
    void findById_whenMissing_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(99L)).isInstanceOf(TaskNotFoundException.class);
    }

    @Test
    void create_savesTrimmedTitle() {
        when(repository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(10L);
            return t;
        });

        TaskResponse result = service.create(new TaskRequest("  Nova  ", "desc", false));

        assertThat(result.id()).isEqualTo(10L);
        assertThat(result.title()).isEqualTo("Nova");
        verify(repository).save(any(Task.class));
    }

    @Test
    void update_changesAllFields() {
        Task existing = task(1L, "Old", false);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        TaskResponse result = service.update(1L, new TaskRequest("New", "d", true));

        assertThat(result.title()).isEqualTo("New");
        assertThat(result.description()).isEqualTo("d");
        assertThat(result.done()).isTrue();
    }

    @Test
    void update_whenMissing_throwsNotFound() {
        when(repository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(5L, new TaskRequest("x", null, false)))
                .isInstanceOf(TaskNotFoundException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void delete_removesExistingTask() {
        Task existing = task(1L, "A", false);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        service.delete(1L);

        verify(repository).delete(existing);
    }

    @Test
    void delete_whenMissing_throwsNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(1L)).isInstanceOf(TaskNotFoundException.class);
    }
}
