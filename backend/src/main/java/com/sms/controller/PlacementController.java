package com.sms.controller;

import com.sms.entity.PlacementReadiness;
import com.sms.service.PlacementService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/placement")
public class PlacementController {
    private final PlacementService service;

    public PlacementController(PlacementService s) {
        service = s;
    }

    @GetMapping("/student/mine")
    @PreAuthorize("hasRole('STUDENT')")
    public PlacementReadiness studentMine(Authentication a) {
        return service.getOrCreateStudentReadiness(a.getName());
    }

    @GetMapping("/student/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public PlacementReadiness studentDetails(@PathVariable Long id) {
        return service.getStudentReadinessById(id);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public Map<String, Object> analytics() {
        return service.getPlacementAnalytics();
    }
}
