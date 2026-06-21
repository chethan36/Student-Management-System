package com.sms.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.AuthenticationException;
import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
 public record ErrorResponse(Instant timestamp, int status, String message, Map<String,String> errors) {}
 @ExceptionHandler(ApiException.class) ResponseEntity<ErrorResponse> api(ApiException e) { return response(e.status(),e.getMessage(),null); }
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException e) {
   Map<String,String> errors=new LinkedHashMap<>(); e.getBindingResult().getFieldErrors().forEach(x->errors.putIfAbsent(x.getField(),x.getDefaultMessage()));
   return response(HttpStatus.BAD_REQUEST,"Validation failed",errors);
 }
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<ErrorResponse> conflict() { return response(HttpStatus.CONFLICT,"Record conflicts with existing data",null); }
 @ExceptionHandler(AuthenticationException.class) ResponseEntity<ErrorResponse> unauthorized() { return response(HttpStatus.UNAUTHORIZED,"Invalid email or password",null); }
 @ExceptionHandler(Exception.class) ResponseEntity<ErrorResponse> generic(Exception e) { return response(HttpStatus.INTERNAL_SERVER_ERROR,"Unexpected server error",null); }
 private ResponseEntity<ErrorResponse> response(HttpStatus s,String m,Map<String,String> e){return ResponseEntity.status(s).body(new ErrorResponse(Instant.now(),s.value(),m,e));}
}
