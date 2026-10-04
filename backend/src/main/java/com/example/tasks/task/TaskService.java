package com.example.tasks.task;

import com.example.tasks.task.dto.TaskRequest;
import com.example.tasks.task.dto.TaskResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findAll() {
        return repository.findAll().stream().map(TaskResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse findById(Long id) {
        return TaskResponse.from(getOrThrow(id));
    }

    public TaskResponse create(TaskRequest request) {
        Task task = new Task();
        apply(task, request);
        return TaskResponse.from(repository.save(task));
    }

    public TaskResponse update(Long id, TaskRequest request) {
        Task task = getOrThrow(id);
        apply(task, request);
        return TaskResponse.from(repository.save(task));
    }

    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private Task getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    private void apply(Task task, TaskRequest r) {
        task.setTitle(r.title().trim());
        task.setDescription(r.description());
        task.setDone(r.done());
    }
}
