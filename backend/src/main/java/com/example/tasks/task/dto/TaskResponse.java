package com.example.tasks.task.dto;

import com.example.tasks.task.Task;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        boolean done,
        @JsonProperty("created_at") LocalDateTime createdAt) {

    public static TaskResponse from(Task t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(), t.isDone(), t.getCreatedAt());
    }
}
