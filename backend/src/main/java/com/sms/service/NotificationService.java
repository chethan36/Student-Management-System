package com.sms.service;

import com.sms.entity.*;
import com.sms.exception.ApiException;
import com.sms.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class NotificationService {
    private final NotificationRepository notifications;
    private final UserRepository users;
    private final AttendanceRepository attendance;

    public NotificationService(NotificationRepository n, UserRepository u, AttendanceRepository a) {
        notifications = n;
        users = u;
        attendance = a;
    }

    @Transactional(readOnly=true)
    public List<Notification> getNotificationsForUser(String email) {
        User u = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.notFound("User"));
        return notifications.findByUserIdOrderByCreatedAtDesc(u.getId());
    }

    @Transactional(readOnly=true)
    public long getUnreadCount(String email) {
        User u = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.notFound("User"));
        return notifications.countByUserIdAndIsReadFalse(u.getId());
    }

    public void markAsRead(Long id, String email) {
        User u = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.notFound("User"));
        Notification n = notifications.findById(id)
                .orElseThrow(() -> ApiException.notFound("Notification"));
        if (!n.getUser().getId().equals(u.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied");
        }
        n.setRead(true);
        notifications.save(n);
    }

    public void markAllAsRead(String email) {
        User u = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.notFound("User"));
        List<Notification> list = notifications.findByUserIdOrderByCreatedAtDesc(u.getId());
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
                notifications.save(n);
            }
        }
    }

    public void createNotification(User user, String message, String type) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        n.setType(type);
        n.setRead(false);
        notifications.save(n);
    }

    public void checkAndAlertLowAttendance(Student student) {
        List<Attendance> records = attendance.findByEnrollmentStudentId(student.getId());
        if (records.isEmpty()) return;

        long present = records.stream().filter(a -> a.getStatus() == Attendance.Status.PRESENT).count();
        double pct = (present * 100.0) / records.size();

        if (pct < 75.0) {
            String msg = String.format("Attendance Alert: Your overall attendance is %.1f%%, which is below the mandatory 75%% limit. You are at risk of detention!", pct);
            // Check if warning already exists to avoid duplication
            boolean exists = notifications.findByUserIdOrderByCreatedAtDesc(student.getUser().getId()).stream()
                    .anyMatch(n -> n.getMessage().contains("Attendance Alert") && !n.isRead());
            if (!exists) {
                createNotification(student.getUser(), msg, "DANGER");
            }
        }
    }
}
