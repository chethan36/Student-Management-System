package com.sms.controller;
import com.sms.dto.ApiDtos.*;
import com.sms.entity.*;
import com.sms.repository.*;
import com.sms.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/admin")
public class AdminController {
 private final AdminService service;private final StudentRepository students;private final FacultyRepository faculty;private final CourseRepository courses;private final DepartmentRepository departments;private final AttendanceRepository attendance;
 public AdminController(AdminService s,StudentRepository st,FacultyRepository f,CourseRepository c,DepartmentRepository d,AttendanceRepository a){service=s;students=st;faculty=f;courses=c;departments=d;attendance=a;}
 @GetMapping("/dashboard") Dashboard dashboard(){long total=attendance.count(),present=attendance.countPresent();return new Dashboard(students.count(),faculty.count(),courses.count(),departments.count(),total==0?0:Math.round(present*10000.0/total)/100.0);}
 @GetMapping("/students") Page<Student> students(@RequestParam(defaultValue="")String search,@PageableDefault(size=10,sort="name")Pageable p){return service.students(search,p);}
 @PostMapping("/students") ResponseEntity<Student> addStudent(@Valid @RequestBody PersonRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.saveStudent(null,r));}
 @PutMapping("/students/{id}") Student editStudent(@PathVariable Long id,@Valid @RequestBody PersonRequest r){return service.saveStudent(id,r);}
 @DeleteMapping("/students/{id}") ResponseEntity<Void> deleteStudent(@PathVariable Long id){service.deleteStudent(id);return ResponseEntity.noContent().build();}
 @GetMapping("/faculty") List<Faculty> faculty(){return faculty.findAll(Sort.by("name"));}
 @PostMapping("/faculty") ResponseEntity<Faculty> addFaculty(@Valid @RequestBody PersonRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.saveFaculty(null,r));}
 @PutMapping("/faculty/{id}") Faculty editFaculty(@PathVariable Long id,@Valid @RequestBody PersonRequest r){return service.saveFaculty(id,r);}
 @DeleteMapping("/faculty/{id}") ResponseEntity<Void> deleteFaculty(@PathVariable Long id){service.deleteFaculty(id);return ResponseEntity.noContent().build();}
 @GetMapping("/courses") List<Course> courses(){return courses.findAll(Sort.by("code"));}
 @PostMapping("/courses") ResponseEntity<Course> addCourse(@Valid @RequestBody CourseRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.saveCourse(null,r));}
 @PutMapping("/courses/{id}") Course editCourse(@PathVariable Long id,@Valid @RequestBody CourseRequest r){return service.saveCourse(id,r);}
 @DeleteMapping("/courses/{id}") ResponseEntity<Void> deleteCourse(@PathVariable Long id){courses.deleteById(id);return ResponseEntity.noContent().build();}
 @GetMapping("/departments") List<Department> departments(){return departments.findAll(Sort.by("name"));}
 @PostMapping("/departments") ResponseEntity<Department> addDepartment(@Valid @RequestBody Department d){d.setId(null);return ResponseEntity.status(HttpStatus.CREATED).body(departments.save(d));}
 @PutMapping("/departments/{id}") Department editDepartment(@PathVariable Long id,@Valid @RequestBody Department d){var current=departments.findById(id).orElseThrow(()->com.sms.exception.ApiException.notFound("Department"));current.setCode(d.getCode());current.setName(d.getName());return departments.save(current);}
 @DeleteMapping("/departments/{id}") ResponseEntity<Void> deleteDepartment(@PathVariable Long id){departments.deleteById(id);return ResponseEntity.noContent().build();}
 @PostMapping("/enrollments") ResponseEntity<Enrollment> enroll(@Valid @RequestBody EnrollmentRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.enroll(r));}
}
