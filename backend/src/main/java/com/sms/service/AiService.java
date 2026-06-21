package com.sms.service;

import com.sms.entity.*;
import com.sms.exception.ApiException;
import com.sms.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AiService {
    private final StudentRepository students;
    private final AttendanceRepository attendance;
    private final MarkRepository marks;
    private final RestTemplate restTemplate;

    private static final String AI_SERVICE_URL = "http://localhost:5001";

    public AiService(StudentRepository s, AttendanceRepository a, MarkRepository m) {
        students = s;
        attendance = a;
        marks = m;
        restTemplate = new RestTemplate();
    }

    public Map<String, Object> getStudentInsights(Long studentId) {
        Student s = students.findById(studentId)
                .orElseThrow(() -> ApiException.notFound("Student"));

        double attendancePct = calculateCurrentAttendancePct(studentId);
        double prevAttendancePct = s.getPreviousAttendance() != null ? s.getPreviousAttendance() : 85.0;
        double assignmentRate = calculateAssignmentRate(studentId);
        double internalsPct = calculateInternalsPct(studentId);
        double prevGpa = s.getPreviousGpa() != null ? s.getPreviousGpa() : 7.50;

        Map<String, Object> riskResult = predictAttendanceRisk(attendancePct, prevAttendancePct, assignmentRate, prevGpa);
        Map<String, Object> gradeResult = predictGrade(attendancePct, internalsPct, assignmentRate);

        Map<String, Object> res = new HashMap<>();
        res.put("studentId", s.getId());
        res.put("usn", s.getUsn());
        res.put("name", s.getName());
        res.put("attendancePct", Math.round(attendancePct * 100.0) / 100.0);
        res.put("prevAttendancePct", prevAttendancePct);
        res.put("assignmentRate", Math.round(assignmentRate * 100.0) / 100.0);
        res.put("internalsPct", Math.round(internalsPct * 100.0) / 100.0);
        res.put("previousGpa", prevGpa);
        res.put("riskPrediction", riskResult);
        res.put("gradePrediction", gradeResult);

        return res;
    }

    public Map<String, Object> getAiDashboardData() {
        List<Student> allStudents = students.findAll();
        List<Map<String, Object>> riskList = new ArrayList<>();
        List<Map<String, Object>> topPerformers = new ArrayList<>();

        int lowRisk = 0, medRisk = 0, highRisk = 0;
        int gradeAp = 0, gradeA = 0, gradeBp = 0, gradeB = 0, gradeC = 0, gradeF = 0;

        for (Student s : allStudents) {
            Map<String, Object> insights = getStudentInsights(s.getId());
            Map<String, Object> riskPred = (Map<String, Object>) insights.get("riskPrediction");
            Map<String, Object> gradePred = (Map<String, Object>) insights.get("gradePrediction");

            String risk = (String) riskPred.get("risk");
            String grade = (String) gradePred.get("predicted_grade");

            if ("Low".equalsIgnoreCase(risk)) lowRisk++;
            else if ("Medium".equalsIgnoreCase(risk)) medRisk++;
            else if ("High".equalsIgnoreCase(risk)) highRisk++;

            if ("A+".equals(grade)) gradeAp++;
            else if ("A".equals(grade)) gradeA++;
            else if ("B+".equals(grade)) gradeBp++;
            else if ("B".equals(grade)) gradeB++;
            else if ("C".equals(grade)) gradeC++;
            else if ("F".equals(grade)) gradeF++;

            Map<String, Object> item = new HashMap<>();
            item.put("id", s.getId());
            item.put("usn", s.getUsn());
            item.put("name", s.getName());
            item.put("department", s.getDepartment().getCode());
            item.put("attendance", insights.get("attendancePct"));
            item.put("risk", risk);
            item.put("predictedGrade", grade);
            item.put("confidence", riskPred.get("confidence"));

            if ("High".equalsIgnoreCase(risk) || "Medium".equalsIgnoreCase(risk)) {
                riskList.add(item);
            }
            if ("A+".equals(grade) || "A".equals(grade)) {
                topPerformers.add(item);
            }
        }

        Map<String, Object> data = new HashMap<>();
        data.put("studentsAtRisk", riskList);
        data.put("topPerformers", topPerformers);
        data.put("riskCounts", Map.of("Low", lowRisk, "Medium", medRisk, "High", highRisk));
        data.put("gradeCounts", Map.of("A+", gradeAp, "A", gradeA, "B+", gradeBp, "B", gradeB, "C", gradeC, "F", gradeF));

        return data;
    }

    // ==========================================
    // CHATBOT CONTEXT COMPILER
    // ==========================================
    public Map<String, Object> compileChatContext(String email, String role) {
        Map<String, Object> ctx = new HashMap<>();

        // 1. Fetch campus overall compliance
        long totalAtt = attendance.count();
        long presentAtt = attendance.countPresent();
        double overallAtt = totalAtt == 0 ? 90.0 : (presentAtt * 100.0) / totalAtt;
        ctx.put("overallAttendance", overallAtt);

        // 2. Fetch list of low-attendance students (< 75%)
        List<Student> allStudents = students.findAll();
        List<Map<String, Object>> lowAttendance = new ArrayList<>();
        List<Map<String, Object>> atRiskList = new ArrayList<>();
        List<Map<String, Object>> topPerformers = new ArrayList<>();

        for (Student s : allStudents) {
            double sAtt = calculateCurrentAttendancePct(s.getId());
            if (sAtt < 75.0) {
                lowAttendance.add(Map.of("usn", s.getUsn(), "name", s.getName(), "attendancePct", sAtt));
            }

            // Quick predictions for chatbot context
            Map<String, Object> insights = getStudentInsights(s.getId());
            Map<String, Object> riskPred = (Map<String, Object>) insights.get("riskPrediction");
            Map<String, Object> gradePred = (Map<String, Object>) insights.get("gradePrediction");

            String risk = (String) riskPred.get("risk");
            String grade = (String) gradePred.get("predicted_grade");

            Map<String, Object> item = Map.of(
                "usn", s.getUsn(),
                "name", s.getName(),
                "risk", risk,
                "confidence", riskPred.get("confidence"),
                "predictedGrade", grade
            );

            if ("High".equalsIgnoreCase(risk) || "Medium".equalsIgnoreCase(risk)) {
                atRiskList.add(item);
            }
            if ("A+".equals(grade) || "A".equals(grade)) {
                topPerformers.add(item);
            }
        }

        ctx.put("lowAttendanceStudents", lowAttendance);
        ctx.put("atRiskStudents", atRiskList);
        ctx.put("topPerformers", topPerformers);

        return ctx;
    }

    public String getAiAssistantResponse(String message, String email, String role) {
        Map<String, Object> context = compileChatContext(email, role);
        Map<String, Object> payload = new HashMap<>();
        payload.put("message", message);
        payload.put("context", context);
        payload.put("role", role);

        try {
            Map<?, ?> response = restTemplate.postForObject(AI_SERVICE_URL + "/chat", payload, Map.class);
            return (String) response.get("response");
        } catch (Exception e) {
            return "Campus AI chatbot engine is temporarily offline. Heuristic fallback: I cannot parse your query without connection to the Python NLP microservice. Please check that port 5001 is active.";
        }
    }

    private double calculateCurrentAttendancePct(Long studentId) {
        List<Attendance> records = attendance.findByEnrollmentStudentId(studentId);
        if (records.isEmpty()) return 90.0;

        long present = records.stream().filter(a -> a.getStatus() == Attendance.Status.PRESENT).count();
        return (present * 100.0) / records.size();
    }

    private double calculateAssignmentRate(Long studentId) {
        List<Mark> studentMarks = marks.findByEnrollmentStudentId(studentId);
        List<Mark> assignments = studentMarks.stream()
                .filter(m -> m.getAssessment().toLowerCase().contains("assignment"))
                .toList();

        if (assignments.isEmpty()) return 85.0;

        BigDecimal scoreSum = BigDecimal.ZERO;
        BigDecimal maxSum = BigDecimal.ZERO;
        for (Mark m : assignments) {
            scoreSum = scoreSum.add(m.getScore());
            maxSum = maxSum.add(m.getMaxScore());
        }

        if (maxSum.compareTo(BigDecimal.ZERO) == 0) return 100.0;
        return scoreSum.multiply(BigDecimal.valueOf(100)).divide(maxSum, 2, RoundingMode.HALF_UP).doubleValue();
    }

    private double calculateInternalsPct(Long studentId) {
        List<Mark> studentMarks = marks.findByEnrollmentStudentId(studentId);
        List<Mark> internals = studentMarks.stream()
                .filter(m -> !m.getAssessment().toLowerCase().contains("assignment"))
                .toList();

        if (internals.isEmpty()) return 75.0;

        BigDecimal scoreSum = BigDecimal.ZERO;
        BigDecimal maxSum = BigDecimal.ZERO;
        for (Mark m : internals) {
            scoreSum = scoreSum.add(m.getScore());
            maxSum = maxSum.add(m.getMaxScore());
        }

        if (maxSum.compareTo(BigDecimal.ZERO) == 0) return 100.0;
        return scoreSum.multiply(BigDecimal.valueOf(100)).divide(maxSum, 2, RoundingMode.HALF_UP).doubleValue();
    }

    private Map<String, Object> predictAttendanceRisk(double attendancePct, double prevAttendancePct, double assignmentRate, double prevGpa) {
        Map<String, Object> body = new HashMap<>();
        body.put("attendance_pct", attendancePct);
        body.put("prev_attendance_pct", prevAttendancePct);
        body.put("assignment_rate", assignmentRate);
        body.put("prev_gpa", prevGpa);

        try {
            return restTemplate.postForObject(AI_SERVICE_URL + "/predict-attendance-risk", body, Map.class);
        } catch (Exception e) {
            // Heuristic Fallback
            String risk = "Low";
            if (attendancePct < 75.0) risk = "High";
            else if (attendancePct < 85.0) risk = "Medium";

            Map<String, Object> fallback = new HashMap<>();
            fallback.put("risk", risk);
            fallback.put("confidence", 0.95);
            fallback.put("explanation", "Fallback prediction model. Current attendance drops under threshold.");
            fallback.put("fallback", true);
            return fallback;
        }
    }

    private Map<String, Object> predictGrade(double attendancePct, double internalsPct, double assignmentRate) {
        Map<String, Object> body = new HashMap<>();
        body.put("attendance_pct", attendancePct);
        body.put("internal_marks_pct", internalsPct);
        body.put("assignment_score_pct", assignmentRate);

        try {
            return restTemplate.postForObject(AI_SERVICE_URL + "/predict-grade", body, Map.class);
        } catch (Exception e) {
            // Heuristic Fallback
            double avg = (attendancePct + internalsPct + assignmentRate) / 3.0;
            String grade = "F";
            if (avg >= 90.0) grade = "A+";
            else if (avg >= 80.0) grade = "A";
            else if (avg >= 70.0) grade = "B+";
            else if (avg >= 60.0) grade = "B";
            else if (avg >= 50.0) grade = "C";

            Map<String, Object> fallback = new HashMap<>();
            fallback.put("predicted_grade", grade);
            fallback.put("confidence", 0.88);
            fallback.put("fallback", true);
            return fallback;
        }
    }
}
