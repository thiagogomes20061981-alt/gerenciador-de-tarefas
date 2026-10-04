package com.example.tasks.task;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(Long id) {
        super("Tarefa " + id + " não encontrada");
    }
}
