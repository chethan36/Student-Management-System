package com.sms.controller;
import com.sms.dto.ApiDtos.*;
import com.sms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {private final AuthService auth;public AuthController(AuthService a){auth=a;}@PostMapping("/login")public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest r){return ResponseEntity.ok(auth.login(r));}@PostMapping("/logout")public ResponseEntity<Void> logout(){return ResponseEntity.noContent().build();}}
