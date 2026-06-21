package com.sms.service;
import com.sms.dto.ApiDtos.*;
import com.sms.entity.*;
import com.sms.repository.*;
import com.sms.security.JwtService;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
 private final AuthenticationManager auth;private final UserRepository users;private final StudentRepository students;private final FacultyRepository faculty;private final JwtService jwt;
 public AuthService(AuthenticationManager a,UserRepository u,StudentRepository s,FacultyRepository f,JwtService j){auth=a;users=u;students=s;faculty=f;jwt=j;}
 public LoginResponse login(LoginRequest request){auth.authenticate(new UsernamePasswordAuthenticationToken(request.email(),request.password()));var u=users.findByEmailIgnoreCase(request.email()).orElseThrow();String name=switch(u.getRole()){case STUDENT->students.findByUserEmailIgnoreCase(u.getEmail()).map(com.sms.entity.Student::getName).orElse(u.getEmail());case FACULTY->faculty.findByUserEmailIgnoreCase(u.getEmail()).map(com.sms.entity.Faculty::getName).orElse(u.getEmail());default->"Administrator";};var details=User.withUsername(u.getEmail()).password(u.getPassword()).roles(u.getRole().name()).build();return new LoginResponse(jwt.generate(details),u.getEmail(),u.getRole(),name);}
}
