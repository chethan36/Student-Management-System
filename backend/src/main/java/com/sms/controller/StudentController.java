package com.sms.controller;
import com.sms.entity.*;
import com.sms.service.StudentService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/student")
public class StudentController {
 private final StudentService service;public StudentController(StudentService s){service=s;}
 @GetMapping("/profile") Student profile(Authentication a){return service.profile(a.getName());}
 @GetMapping("/courses") List<Enrollment> courses(Authentication a){return service.courses(a.getName());}
 @GetMapping("/attendance") List<Attendance> attendance(Authentication a){return service.attendance(a.getName());}
 @GetMapping("/marks") List<Mark> marks(Authentication a){return service.marks(a.getName());}
 @GetMapping(value="/report-card",produces=MediaType.APPLICATION_PDF_VALUE) ResponseEntity<byte[]> report(Authentication a){return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=report-card.pdf").body(service.report(a.getName()));}
}
