package com.quizapp.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HomeController {

    @GetMapping("/home")
    public Map<String, String> home(@AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        Map<String, String> response = new HashMap<>();
        if (user != null) {
            response.put("message", "Welcome to the home page!");
            response.put("user", user.getUsername());
        } else {
            response.put("message", "Not authenticated");
            response.put("user", null);
        }
        return response;
    }
}