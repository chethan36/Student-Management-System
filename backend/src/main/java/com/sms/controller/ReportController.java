package com.sms.controller;

import com.sms.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService service;

    public ReportController(ReportService s) {
        service = s;
    }

    @GetMapping("/students/pdf")
    public ResponseEntity<byte[]> studentsPdf() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(service.exportStudentsPdf());
    }

    @GetMapping("/students/excel")
    public ResponseEntity<byte[]> studentsExcel() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(service.exportStudentsExcel());
    }

    @GetMapping("/attendance/pdf")
    public ResponseEntity<byte[]> attendancePdf() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(service.exportAttendancePdf());
    }

    @GetMapping("/attendance/excel")
    public ResponseEntity<byte[]> attendanceExcel() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(service.exportAttendanceExcel());
    }

    @GetMapping("/performance/pdf")
    public ResponseEntity<byte[]> performancePdf() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=performance-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(service.exportPerformancePdf());
    }

    @GetMapping("/performance/excel")
    public ResponseEntity<byte[]> performanceExcel() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=performance-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(service.exportPerformanceExcel());
    }

    @GetMapping("/placement/pdf")
    public ResponseEntity<byte[]> placementPdf() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=placement-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(service.exportPlacementPdf());
    }

    @GetMapping("/placement/excel")
    public ResponseEntity<byte[]> placementExcel() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=placement-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(service.exportPlacementExcel());
    }

    @GetMapping("/ai/pdf")
    public ResponseEntity<byte[]> aiPdf() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ai-insights-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(service.exportAiInsightsPdf());
    }

    @GetMapping("/ai/excel")
    public ResponseEntity<byte[]> aiExcel() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ai-insights-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(service.exportAiInsightsExcel());
    }
}
