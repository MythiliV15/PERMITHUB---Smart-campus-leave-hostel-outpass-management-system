package com.permithub.service;

public interface EmailService {
    /** Sends reset email synchronously; returns true if SMTP accepted the message. */
    boolean sendPasswordResetEmail(String to, String name, String token);
    void sendWelcomeEmail(String to, String name, String tempPassword);
    void sendLeaveApprovalEmail(String to, String name, String status, String remarks);
    void sendOdApprovalEmail(String to, String name, String status, String remarks);
    void sendOutpassApprovalEmail(String to, String name, String status);
}
