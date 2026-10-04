package com.example.tasks.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskRequest(
        @NotBlank(message = "title é obrigatório") @Size(max = 150) String title,
        @Size(max = 2000) String description,
        boolean done) {
}
