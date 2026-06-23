package com.sms.controller;
import com.sms.dto.ApiDtos.*;
import com.sms.entity.*;
import com.sms.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/faculty")
public class FacultyController {
 private final FacultyService service;public FacultyController(FacultyService s){service=s;}
 @GetMapping("/courses") List<Course> courses(Authentication a){return service.courses(a.getName());}
 @GetMapping("/courses/{id}/students") List<Enrollment> roster(Authentication a,@PathVariable Long id){return service.roster(a.getName(),id);}
 @PostMapping("/courses/{id}/attendance") List<Attendance> attendance(Authentication a,@PathVariable Long id,@Valid @RequestBody AttendanceRequest r){return service.attendance(a.getName(),id,r);}
 @PostMapping("/marks") Mark marks(Authentication a,@Valid @RequestBody MarkRequest r){return service.mark(a.getName(),r);}
 @GetMapping("/students") Page<Student> students(@RequestParam(defaultValue="")String search,@PageableDefault(size=10,sort="name")Pageable p){return service.search(search,p);}
 @GetMapping("/students/{id}/performance") List<Mark> performance(Authentication a,@PathVariable Long id){return service.performance(a.getName(),id);}
 @GetMapping("/stats") public java.util.Map<String, Object> stats(Authentication a){return service.getFacultyStats(a.getName());}
}
