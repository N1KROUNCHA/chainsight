package com.chainsight.controller;

import com.chainsight.model.User;
import com.chainsight.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        return authService.login(credentials.get("email"), credentials.get("password"))
                .map(u -> ResponseEntity.ok(u))
                .orElse(ResponseEntity.status(401).build());
    }
}
