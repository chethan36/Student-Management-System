package com.sms.entity;

import jakarta.persistence.*;

@Entity
@Table(name="notifications")
public class Notification extends BaseEntity {
    @ManyToOne(optional=false)
    @JoinColumn(name="user_id")
    private User user;

    @Column(nullable=false, length=500)
    private String message;

    @Column(nullable=false, length=20)
    private String type; // e.g. INFO, WARNING, DANGER

    @Column(name="is_read", nullable=false)
    private boolean isRead = false;

    public Notification() {}

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}
