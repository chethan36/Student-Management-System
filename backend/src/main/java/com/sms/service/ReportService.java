package com.sms.service;

import com.sms.entity.*;
import com.sms.repository.*;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReportService {
    private final StudentRepository students;
    private final CourseRepository courses;
    private final AttendanceRepository attendance;
    private final MarkRepository marks;
    private final PlacementReadinessRepository placementRepository;
    private final AiService aiService;

    public ReportService(StudentRepository s, CourseRepository c, AttendanceRepository a, MarkRepository m, 
                         PlacementReadinessRepository p, AiService ai) {
        students = s;
        courses = c;
        attendance = a;
        marks = m;
        placementRepository = p;
        aiService = ai;
    }

    // ==========================================
    // EXCEL EXPORTS
    // ==========================================

    public byte[] exportStudentsExcel() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Students");
            Row header = sheet.createRow(0);
            String[] cols = {"USN", "Name", "Email", "Department", "Semester", "Phone"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                CellStyle style = wb.createCellStyle();
                Font font = wb.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            List<Student> list = students.findAll();
            int rIdx = 1;
            for (Student s : list) {
                Row row = sheet.createRow(rIdx++);
                row.createCell(0).setCellValue(s.getUsn());
                row.createCell(1).setCellValue(s.getName());
                row.createCell(2).setCellValue(s.getUser().getEmail());
                row.createCell(3).setCellValue(s.getDepartment().getName());
                row.createCell(4).setCellValue(s.getSemester());
                row.createCell(5).setCellValue(s.getPhone() != null ? s.getPhone() : "");
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    public byte[] exportAttendanceExcel() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Attendance Report");
            Row header = sheet.createRow(0);
            String[] cols = {"Student USN", "Student Name", "Course Code", "Course Name", "Date", "Status"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                CellStyle style = wb.createCellStyle();
                Font font = wb.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            List<Attendance> list = attendance.findAll();
            int rIdx = 1;
            for (Attendance a : list) {
                Row row = sheet.createRow(rIdx++);
                row.createCell(0).setCellValue(a.getEnrollment().getStudent().getUsn());
                row.createCell(1).setCellValue(a.getEnrollment().getStudent().getName());
                row.createCell(2).setCellValue(a.getEnrollment().getCourse().getCode());
                row.createCell(3).setCellValue(a.getEnrollment().getCourse().getName());
                row.createCell(4).setCellValue(a.getDate().toString());
                row.createCell(5).setCellValue(a.getStatus().toString());
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    public byte[] exportPerformanceExcel() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Performance Report");
            Row header = sheet.createRow(0);
            String[] cols = {"Student USN", "Student Name", "Course Code", "Assessment", "Score", "Max Score", "Grade"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                CellStyle style = wb.createCellStyle();
                Font font = wb.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            List<Mark> list = marks.findAll();
            int rIdx = 1;
            for (Mark m : list) {
                Row row = sheet.createRow(rIdx++);
                row.createCell(0).setCellValue(m.getEnrollment().getStudent().getUsn());
                row.createCell(1).setCellValue(m.getEnrollment().getStudent().getName());
                row.createCell(2).setCellValue(m.getEnrollment().getCourse().getCode());
                row.createCell(3).setCellValue(m.getAssessment());
                row.createCell(4).setCellValue(m.getScore().doubleValue());
                row.createCell(5).setCellValue(m.getMaxScore().doubleValue());
                row.createCell(6).setCellValue(m.getGrade() != null ? m.getGrade() : "-");
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    public byte[] exportPlacementExcel() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Placement Readiness Report");
            Row header = sheet.createRow(0);
            String[] cols = {"USN", "Name", "Aptitude Score", "DSA Score", "Coding Score", "Communication Score", "Resume Score", "Hiring Success Probability", "Skills Gap & Recommendation"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                CellStyle style = wb.createCellStyle();
                Font font = wb.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            List<Student> list = students.findAll();
            int rIdx = 1;
            for (Student s : list) {
                PlacementReadiness pr = placementRepository.findByStudentId(s.getId()).orElseGet(() -> {
                    PlacementReadiness fallback = new PlacementReadiness();
                    fallback.setStudent(s);
                    fallback.setAptitudeScore(BigDecimal.valueOf(60.00));
                    fallback.setDsaScore(BigDecimal.valueOf(60.00));
                    fallback.setCodingScore(BigDecimal.valueOf(60.00));
                    fallback.setCommunicationScore(BigDecimal.valueOf(70.00));
                    fallback.setResumeScore(BigDecimal.valueOf(65.00));
                    fallback.setSkillsGap("Review programming fundamentals.");
                    fallback.setInterviewProbability(BigDecimal.valueOf(55.00));
                    return fallback;
                });
                Row row = sheet.createRow(rIdx++);
                row.createCell(0).setCellValue(s.getUsn());
                row.createCell(1).setCellValue(s.getName());
                row.createCell(2).setCellValue(pr.getAptitudeScore().doubleValue());
                row.createCell(3).setCellValue(pr.getDsaScore().doubleValue());
                row.createCell(4).setCellValue(pr.getCodingScore().doubleValue());
                row.createCell(5).setCellValue(pr.getCommunicationScore().doubleValue());
                row.createCell(6).setCellValue(pr.getResumeScore().doubleValue());
                row.createCell(7).setCellValue(pr.getInterviewProbability().doubleValue());
                row.createCell(8).setCellValue(pr.getSkillsGap());
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    public byte[] exportAiInsightsExcel() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("AI Academic Insights Report");
            Row header = sheet.createRow(0);
            String[] cols = {"USN", "Name", "Attendance Rate %", "Assignment Rate %", "Internal Exam Score %", "Detention Risk", "Risk Confidence", "Projected Grade", "Grade Confidence"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                CellStyle style = wb.createCellStyle();
                Font font = wb.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            List<Student> list = students.findAll();
            int rIdx = 1;
            for (Student s : list) {
                Map<String, Object> insights = aiService.getStudentInsights(s.getId());
                Map<String, Object> riskPred = (Map<String, Object>) insights.get("riskPrediction");
                Map<String, Object> gradePred = (Map<String, Object>) insights.get("gradePrediction");

                Row row = sheet.createRow(rIdx++);
                row.createCell(0).setCellValue(s.getUsn());
                row.createCell(1).setCellValue(s.getName());
                row.createCell(2).setCellValue((Double) insights.get("attendancePct"));
                row.createCell(3).setCellValue((Double) insights.get("assignmentRate"));
                row.createCell(4).setCellValue((Double) insights.get("internalsPct"));
                row.createCell(5).setCellValue((String) riskPred.get("risk"));
                row.createCell(6).setCellValue(riskPred.get("confidence") != null ? ((Number) riskPred.get("confidence")).doubleValue() : 0.0);
                row.createCell(7).setCellValue((String) gradePred.get("predicted_grade"));
                row.createCell(8).setCellValue(gradePred.get("confidence") != null ? ((Number) gradePred.get("confidence")).doubleValue() : 0.0);
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    // ==========================================
    // PDF EXPORTS
    // ==========================================

    public byte[] exportStudentsPdf() {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                var normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                float y = 730;
                cs.beginText();
                cs.setFont(bold, 18);
                cs.newLineAtOffset(50, y);
                cs.showText("CampusCore - Student Roster Report");
                cs.endText();
                y -= 30;

                List<Student> list = students.findAll();
                for (Student s : list) {
                    y = writeLine(cs, normal, 10, 50, y,
                            String.format("USN: %s  |  Name: %s  |  Dept: %s  |  Sem: %d",
                                    s.getUsn(), s.getName(), s.getDepartment().getCode(), s.getSemester()));
                    if (y < 50) break;
                }
            }
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] exportAttendancePdf() {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                var normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                float y = 730;
                cs.beginText();
                cs.setFont(bold, 18);
                cs.newLineAtOffset(50, y);
                cs.showText("CampusCore - Attendance Summary Report");
                cs.endText();
                y -= 30;

                List<Attendance> list = attendance.findAll();
                for (Attendance a : list) {
                    y = writeLine(cs, normal, 9, 50, y,
                            String.format("%s - %s  |  %s: %s  |  Status: %s",
                                    a.getEnrollment().getStudent().getUsn(),
                                    a.getEnrollment().getStudent().getName(),
                                    a.getEnrollment().getCourse().getCode(),
                                    a.getDate(),
                                    a.getStatus()));
                    if (y < 50) break;
                }
            }
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] exportPerformancePdf() {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                var normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                float y = 730;
                cs.beginText();
                cs.setFont(bold, 18);
                cs.newLineAtOffset(50, y);
                cs.showText("CampusCore - Academic Performance Report");
                cs.endText();
                y -= 30;

                List<Mark> list = marks.findAll();
                for (Mark m : list) {
                    y = writeLine(cs, normal, 9, 50, y,
                            String.format("USN: %s  |  Course: %s  |  %s: %s/%s  |  Grade: %s",
                                    m.getEnrollment().getStudent().getUsn(),
                                    m.getEnrollment().getCourse().getCode(),
                                    m.getAssessment(),
                                    m.getScore(),
                                    m.getMaxScore(),
                                    m.getGrade() != null ? m.getGrade() : "-"));
                    if (y < 50) break;
                }
            }
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] exportPlacementPdf() {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                var normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                float y = 730;
                cs.beginText();
                cs.setFont(bold, 18);
                cs.newLineAtOffset(50, y);
                cs.showText("CampusCore - Placement Hiring Readiness Report");
                cs.endText();
                y -= 35;

                List<Student> list = students.findAll();
                for (Student s : list) {
                    PlacementReadiness pr = placementRepository.findByStudentId(s.getId()).orElseGet(() -> {
                        PlacementReadiness fallback = new PlacementReadiness();
                        fallback.setStudent(s);
                        fallback.setAptitudeScore(BigDecimal.valueOf(60.00));
                        fallback.setDsaScore(BigDecimal.valueOf(60.00));
                        fallback.setCodingScore(BigDecimal.valueOf(60.00));
                        fallback.setCommunicationScore(BigDecimal.valueOf(70.00));
                        fallback.setResumeScore(BigDecimal.valueOf(65.00));
                        fallback.setSkillsGap("Review programming fundamentals.");
                        fallback.setInterviewProbability(BigDecimal.valueOf(55.00));
                        return fallback;
                    });

                    y = writeLine(cs, normal, 9, 50, y,
                            String.format("USN: %s  | Name: %s  | Apt: %s  | DSA: %s  | Code: %s  | Prob: %s%%",
                                    s.getUsn(), s.getName(),
                                    pr.getAptitudeScore(), pr.getDsaScore(), pr.getCodingScore(),
                                    pr.getInterviewProbability()));
                    if (y < 50) break;
                }
            }
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] exportAiInsightsPdf() {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                var normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                float y = 730;
                cs.beginText();
                cs.setFont(bold, 18);
                cs.newLineAtOffset(50, y);
                cs.showText("CampusCore - AI Predictive Insights & Risks Report");
                cs.endText();
                y -= 35;

                List<Student> list = students.findAll();
                for (Student s : list) {
                    Map<String, Object> insights = aiService.getStudentInsights(s.getId());
                    Map<String, Object> riskPred = (Map<String, Object>) insights.get("riskPrediction");
                    Map<String, Object> gradePred = (Map<String, Object>) insights.get("gradePrediction");

                    y = writeLine(cs, normal, 9, 50, y,
                            String.format("USN: %s | %s | Att: %s%% | Risk: %s (%s%%) | Grade: %s (%s%%)",
                                    s.getUsn(), s.getName(),
                                    insights.get("attendancePct"),
                                    riskPred.get("risk"),
                                    Math.round(((Number) riskPred.get("confidence")).doubleValue() * 100),
                                    gradePred.get("predicted_grade"),
                                    Math.round(((Number) gradePred.get("confidence")).doubleValue() * 100)));
                    if (y < 50) break;
                }
            }
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private float writeLine(PDPageContentStream cs, PDType1Font font, float size, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text.replaceAll("[^\\x20-\\x7E]", "?"));
        cs.endText();
        return y - 18;
    }
}
