package com.sms.controller;

import com.sms.entity.Notification;
import com.sms.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService s) {
        service = s;
    }

    @GetMapping
    public List<Notification> list(Authentication a) {
        return service.getNotificationsForUser(a.getName());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication a) {
        return Map.of("count", service.getUnreadCount(a.getName()));
    }

    @PutMapping("/{id}/read")
    public void read(@PathVariable Long id, Authentication a) {
        service.markAsRead(id, a.getName());
    }

    @PostMapping("/read-all")
    public void readAll(Authentication a) {
        service.markAllAsRead(a.getName());
    }
}
