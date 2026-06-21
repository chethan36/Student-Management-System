package com.sms;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sms.controller.AuthController;
import com.sms.dto.ApiDtos.*;
import com.sms.entity.Role;
import com.sms.exception.GlobalExceptionHandler;
import com.sms.service.AuthService;
import org.junit.jupiter.api.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
class AuthControllerTest {
 private MockMvc mvc; private AuthService auth; private final ObjectMapper json=new ObjectMapper();
 @BeforeEach void setup(){auth=new AuthService(null,null,null,null,null){@Override public LoginResponse login(LoginRequest request){return new LoginResponse("jwt",request.email(),Role.ADMIN,"Administrator");}};mvc=MockMvcBuilders.standaloneSetup(new AuthController(auth)).setControllerAdvice(new GlobalExceptionHandler()).build();}
 @Test void rejectsMalformedLogin() throws Exception {mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"bad\",\"password\":\"\"}")).andExpect(status().isBadRequest());}
 @Test void acceptsValidLogin() throws Exception {mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(new LoginRequest("admin@sms.local","password")))).andExpect(status().isOk());}
}
