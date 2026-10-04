package com.example.tasks.task;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.tasks.task.dto.TaskRequest;
import com.example.tasks.task.dto.TaskResponse;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean TaskService service;

    private static final TaskResponse SAMPLE =
            new TaskResponse(1L, "Estudar", "desc", false, LocalDateTime.of(2025, 1, 1, 10, 0));

    @Test
    void withoutToken_returns401() throws Exception {
        mvc.perform(get("/tasks")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void list_returnsTasksWithSnakeCaseDate() throws Exception {
        when(service.findAll()).thenReturn(List.of(SAMPLE));

        mvc.perform(get("/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Estudar"))
                .andExpect(jsonPath("$[0].created_at").value("2025-01-01T10:00:00"));
    }

    @Test
    @WithMockUser
    void get_returnsTask() throws Exception {
        when(service.findById(1L)).thenReturn(SAMPLE);

        mvc.perform(get("/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser
    void get_whenMissing_returns404() throws Exception {
        when(service.findById(9L)).thenThrow(new TaskNotFoundException(9L));

        mvc.perform(get("/tasks/9")).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void create_returns201WithLocation() throws Exception {
        when(service.create(any(TaskRequest.class))).thenReturn(SAMPLE);

        mvc.perform(post("/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Estudar\",\"description\":\"desc\",\"done\":false}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/tasks/1"));
    }

    @Test
    @WithMockUser
    void create_withBlankTitle_returns400() throws Exception {
        mvc.perform(post("/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"  \",\"done\":false}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser
    void update_returnsUpdatedTask() throws Exception {
        when(service.update(eq(1L), any(TaskRequest.class))).thenReturn(SAMPLE);

        mvc.perform(put("/tasks/1").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Estudar\",\"description\":\"desc\",\"done\":true}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_returns204() throws Exception {
        mvc.perform(delete("/tasks/1")).andExpect(status().isNoContent());
        verify(service).delete(1L);
    }
}
