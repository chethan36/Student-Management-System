package com.sms.controller;

import com.sms.entity.Student;
import com.sms.service.AiService;
import com.sms.service.StudentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiService aiService;
    private final StudentService studentService;

    public AiController(AiService ai, StudentService st) {
        aiService = ai;
        studentService = st;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public Map<String, Object> dashboard() {
        return aiService.getAiDashboardData();
    }

    @GetMapping("/student/mine")
    @PreAuthorize("hasRole('STUDENT')")
    public Map<String, Object> studentMine(Authentication a) {
        Student s = studentService.profile(a.getName());
        return aiService.getStudentInsights(s.getId());
    }

    @GetMapping("/student/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public Map<String, Object> studentInsights(@PathVariable Long id) {
        return aiService.getStudentInsights(id);
    }

    @PostMapping("/assistant/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> payload, Authentication a) {
        String msg = payload.get("message");
        String email = a.getName();
        String role = a.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        String resp = aiService.getAiAssistantResponse(msg, email, role);
        return Map.of("response", resp);
    }
}

